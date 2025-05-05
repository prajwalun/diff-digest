// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/api/github-tools.ts
import axios from "axios";
var getHeaders = () => {
  const headers = {
    "Accept": "application/vnd.github.v3+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};
async function fetchRelatedIssues(owner, repo, prBody) {
  try {
    const issueRegex = /(?:(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+(?:#|GH-|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#)(\d+))|(?:#|GH-|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#)(\d+)/gi;
    const issueNumbers = [];
    let match;
    while ((match = issueRegex.exec(prBody)) !== null) {
      const issueNumber = parseInt(match[1] || match[2], 10);
      if (issueNumber && !issueNumbers.includes(issueNumber)) {
        issueNumbers.push(issueNumber);
      }
    }
    if (issueNumbers.length === 0) return [];
    const issues = await Promise.all(
      issueNumbers.map(async (issueNumber) => {
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
            { headers: getHeaders() }
          );
          return {
            number: response.data.number,
            title: response.data.title,
            url: response.data.html_url,
            state: response.data.state,
            createdAt: response.data.created_at,
            author: {
              login: response.data.user.login,
              url: response.data.user.html_url
            }
          };
        } catch (error) {
          console.error(`Error fetching issue #${issueNumber}:`, error);
          return null;
        }
      })
    );
    return issues.filter(Boolean);
  } catch (error) {
    console.error("Error extracting or fetching related issues:", error);
    return [];
  }
}
async function fetchPRFiles(owner, repo, prNumber) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
      { headers: getHeaders() }
    );
    return response.data.map((file) => ({
      filename: file.filename,
      status: file.status,
      // added, modified, removed
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes
    }));
  } catch (error) {
    console.error(`Error fetching files for PR #${prNumber}:`, error);
    return [];
  }
}
async function getPRMetadata(owner, repo, prNumber) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: getHeaders() }
    );
    return {
      title: response.data.title,
      state: response.data.state,
      merged: response.data.merged,
      mergedAt: response.data.merged_at,
      author: {
        login: response.data.user.login,
        url: response.data.user.html_url
      },
      requestedReviewers: response.data.requested_reviewers?.map((reviewer) => ({
        login: reviewer.login,
        url: reviewer.html_url
      })) || [],
      labels: response.data.labels?.map((label) => ({
        name: label.name,
        color: label.color
      })) || [],
      branchName: response.data.head.ref
    };
  } catch (error) {
    console.error(`Error fetching metadata for PR #${prNumber}:`, error);
    return null;
  }
}
async function getRepoStats(owner, repo) {
  try {
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: getHeaders() }
    );
    return {
      stars: repoResponse.data.stargazers_count,
      forks: repoResponse.data.forks_count,
      watchers: repoResponse.data.watchers_count,
      openIssues: repoResponse.data.open_issues_count,
      description: repoResponse.data.description,
      language: repoResponse.data.language,
      createdAt: repoResponse.data.created_at,
      updatedAt: repoResponse.data.updated_at
    };
  } catch (error) {
    console.error(`Error fetching stats for ${owner}/${repo}:`, error);
    return null;
  }
}

// server/api/github.ts
import fetch2 from "node-fetch";
async function getPullRequests(req, res) {
  try {
    const { owner, repo, page = "1", per_page = "10" } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Missing required parameters: owner and repo" });
    }
    const pageNum = parseInt(page, 10) || 1;
    const perPageNum = parseInt(per_page, 10) || 10;
    const sanitizedPerPage = Math.min(Math.max(perPageNum, 5), 100);
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&page=${pageNum}&per_page=${sanitizedPerPage}`;
    const response = await fetch2(url);
    const linkHeader = response.headers.get("Link");
    const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : false;
    const hasPrevPage = linkHeader ? linkHeader.includes('rel="prev"') : false;
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.message || `GitHub API error: ${response.status}`
      });
    }
    const pullRequests = await response.json();
    let totalCount = null;
    try {
      const countResponse = await fetch2(`https://api.github.com/repos/${owner}/${repo}`);
      if (countResponse.ok) {
        const repoData = await countResponse.json();
        totalCount = repoData.open_issues_count;
      }
    } catch (error) {
      console.warn("Could not get total PR count:", error);
    }
    return res.json({
      pullRequests,
      pagination: {
        page: pageNum,
        per_page: sanitizedPerPage,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
        total_count: totalCount
      }
    });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  const server = createServer(app2);
  app2.get("/api/github/prs", getPullRequests);
  app2.get("/api/github/prs/legacy", async (req, res) => {
    try {
      const { owner, repo } = req.query;
      if (!owner || !repo) {
        return res.status(400).json({ error: "Missing required parameters: owner and repo" });
      }
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=20`);
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({
          error: errorData.message || `GitHub API error: ${response.status}`
        });
      }
      let pullRequests = await response.json();
      pullRequests = pullRequests.filter((pr) => pr.merged_at !== null);
      const prsWithDiff = await Promise.all(
        pullRequests.map(async (pr) => {
          try {
            const diffResponse = await fetch(pr.diff_url, {
              headers: {
                "Accept": "application/vnd.github.v3.diff"
              }
            });
            if (diffResponse.ok) {
              const diffContent = await diffResponse.text();
              return {
                ...pr,
                diff_content: diffContent
              };
            }
            return pr;
          } catch (error) {
            console.error("Error fetching diff for PR:", error);
            return pr;
          }
        })
      );
      return res.json({ pullRequests: prsWithDiff });
    } catch (error) {
      console.error("Error fetching PRs:", error);
      return res.status(500).json({ error: "Failed to fetch pull requests" });
    }
  });
  app2.post("/api/notes/generate", async (req, res) => {
    try {
      console.log("Starting note generation with payload:", JSON.stringify(req.body, null, 2).substring(0, 200) + "...");
      const { owner, repo, pr_number, pr_title, pr_diff, diff_content } = req.body;
      if (!pr_number) {
        return res.status(400).json({
          error: "Missing required parameter: PR number"
        });
      }
      let diffContent = diff_content || "";
      if (!diffContent && pr_diff) {
        try {
          const diffResponse = await fetch(pr_diff);
          diffContent = await diffResponse.text();
        } catch (error) {
          console.error("Error fetching PR diff:", error);
        }
      }
      const isApiKeyAvailable = !!process.env.OPENAI_API_KEY;
      console.log("OpenAI client ready:", isApiKeyAvailable ? "Yes" : "No");
      if (!isApiKeyAvailable) {
        console.warn("OpenAI API key not found or invalid. Using fallback generated content.");
        const prInfo = {
          owner,
          repo,
          number: pr_number,
          title: pr_title || `PR #${pr_number}`
        };
        return res.json({
          technicalNotes: createFallbackTechnicalNotes(prInfo),
          marketingNotes: createFallbackMarketingNotes(prInfo),
          error: "OPENAI_API_KEY not found. Using fallback content."
        });
      }
      const OpenAI = await import("openai");
      console.log("API Key available for OpenAI:", !!process.env.OPENAI_API_KEY);
      console.log("API Key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
      console.log("API Key prefix:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) + "..." : "none");
      let openai;
      try {
        openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
        console.log("OpenAI client initialized successfully");
      } catch (error) {
        console.error("Error initializing OpenAI client:", error);
        throw error;
      }
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}

`);
      };
      const developerSystemPrompt = `
You are an expert AI assistant tasked with generating **high-quality technical developer release notes** from a GitHub pull request.

\u{1F3AF} GOAL:
Summarize what was changed, why it was changed, and how it was implemented. Use clean, structured HTML formatting that is visually readable when rendered on a web UI.

\u{1F4CC} STRUCTURE:
Always organize the output into the following consistent sections using proper HTML tags:

1. <h4>Summary</h4>
   - Briefly describe the core purpose of the pull request and its scope.

2. <h4>Key Changes</h4>
   - List the most important updates in <ul><li>...</li></ul> format. Mention changed files, functions, or modules.

3. <h4>Implementation Details</h4>
   - Explain how changes were implemented (e.g., new logic, refactoring, added checks). Include <code>...</code> blocks for important variable/method names.

4. <h4>Performance or Security Considerations</h4>
   - Note any impact on speed, security, or stability. If none, say so explicitly.

5. <h4>Testing & Validation</h4>
   - Describe how changes were tested (unit, integration, manual) and whether new tests were added.

\u2705 FORMATTING RULES:
- Use proper HTML: <p>, <ul>, <li>, <strong>, <code>, etc.
- DO NOT wrap the response in \`\`\`html fences or markdown code blocks.
- Do not add an introduction or explain what you're doing. Just return the HTML content.
- Use <code> tags for ALL code elements, variables, function names, and technical references

Required HTML structure:
<h4>Overview of Changes</h4>
<p>
  Start with a comprehensive explanation paragraph of the technical implementation. This must be
  wrapped in proper paragraph tags with appropriate spacing.
</p>

<h4>Technical Implementation</h4>
<p>
  Detailed technical content about the implementation specifics. Every paragraph
  must be properly wrapped in p tags. Never use bare text without proper HTML tags.
</p>
<ul>
  <li><strong>Component Changed:</strong> Details about the specific component with <code>exact_code</code> references</li>
  <li><strong>Core Mechanism:</strong> Technical explanation with specifics about how it works</li>
  <li><strong>Architecture Impact:</strong> How this affects the overall system architecture</li>
</ul>

<h4>Development Considerations</h4>
<p>
  Additional context about implementation decisions, trade-offs, or technical details that affected the approach.
</p>

Your output MUST be properly formatted, structured HTML with no gaps in tag coverage.
No content should ever appear outside of the proper HTML tags.
Do NOT include markdown fences, intro lines, or any commentary.
Ensure consistent spacing, indentation, and proper tag nesting throughout the document.
`;
      sendEvent({ type: "developer", content: "", status: "start" });
      let additionalContext = "";
      if (owner && repo && pr_number) {
        try {
          sendEvent({ type: "enrichment", content: "Fetching related data...", status: "start" });
          const enrichedData = {};
          const metadata = await getPRMetadata(owner, repo, parseInt(pr_number));
          if (metadata) {
            additionalContext += `
PR Metadata:
- Branch: ${metadata.branchName}
- Author: ${metadata.author.login}
`;
            if (metadata.labels && metadata.labels.length > 0) {
              additionalContext += `- Labels: ${metadata.labels.map((l) => l.name).join(", ")}
`;
            }
          }
          const files = await fetchPRFiles(owner, repo, parseInt(pr_number));
          if (files && files.length > 0) {
            const fileStats = {
              added: files.filter((f) => f.status === "added").length,
              modified: files.filter((f) => f.status === "modified").length,
              removed: files.filter((f) => f.status === "removed").length,
              totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
              totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
              keyFiles: files.slice(0, 5).map((file) => ({
                name: file.filename,
                additions: file.additions,
                deletions: file.deletions
              }))
            };
            enrichedData.fileStats = fileStats;
            additionalContext += `
Files Changed (${files.length}):
`;
            additionalContext += `- Added: ${fileStats.added}, Modified: ${fileStats.modified}, Removed: ${fileStats.removed}
`;
            additionalContext += `- Total Additions: ${fileStats.totalAdditions}, Total Deletions: ${fileStats.totalDeletions}
`;
            additionalContext += "- Key Files:\n";
            fileStats.keyFiles.forEach((file) => {
              additionalContext += `  - ${file.name} (${file.additions} additions, ${file.deletions} deletions)
`;
            });
            sendEvent({
              type: "enrichment",
              content: "File statistics gathered",
              status: "progress",
              data: { fileStats }
            });
          }
          if (metadata && pr_number) {
            sendEvent({ type: "enrichment", content: "Analyzing related issues...", status: "progress" });
            const relatedIssues = await fetchRelatedIssues(owner, repo, metadata.description || "");
            if (relatedIssues && relatedIssues.length > 0) {
              const formattedIssues = relatedIssues.map((issue) => ({
                number: issue.number,
                title: issue.title,
                url: issue.html_url
              }));
              enrichedData.relatedIssues = formattedIssues;
              additionalContext += `
Related Issues (${relatedIssues.length}):
`;
              relatedIssues.forEach((issue) => {
                additionalContext += `- #${issue.number}: ${issue.title}
`;
              });
              sendEvent({
                type: "enrichment",
                content: "Related issues identified",
                status: "progress",
                data: { relatedIssues: formattedIssues }
              });
            }
          }
          sendEvent({ type: "enrichment", content: "Collecting repository context...", status: "progress" });
          const repoStats = await getRepoStats(owner, repo);
          if (repoStats) {
            enrichedData.repoStats = {
              stars: repoStats.stars,
              forks: repoStats.forks,
              language: repoStats.language
            };
            additionalContext += `
Repository Context:
`;
            additionalContext += `- Stars: ${repoStats.stars}, Forks: ${repoStats.forks}
`;
            additionalContext += `- Primary Language: ${repoStats.language}
`;
            sendEvent({
              type: "enrichment",
              content: "Repository information collected",
              status: "progress",
              data: { repoStats: enrichedData.repoStats }
            });
          }
          sendEvent({
            type: "enrichment",
            content: "Data enrichment complete",
            status: "complete",
            data: enrichedData
          });
        } catch (error) {
          console.error("Error fetching additional context:", error);
          sendEvent({ type: "enrichment", content: "Error fetching additional data", status: "error" });
        }
      }
      console.log("Attempting to create OpenAI chat completion with model: gpt-4o");
      let technicalStream;
      try {
        technicalStream = await openai.chat.completions.create({
          model: "gpt-4o",
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: developerSystemPrompt },
            {
              role: "user",
              content: `
                PR Title: ${pr_title}
                PR Number: ${pr_number}
                
                ${additionalContext ? "Additional Context:\n" + additionalContext + "\n" : ""}
                Diff Content:
                ${diffContent.substring(0, 3e4)}  // Limiting diff size for token constraints
                
                Generate comprehensive developer notes for this pull request using HTML formatting.
                IMPORTANT: Do not wrap your response in HTML code block tags (like \`\`\`html) or any markdown fences.
              `
            }
          ],
          stream: true
        });
        console.log("OpenAI chat completion created successfully");
      } catch (error) {
        console.error("Error creating OpenAI chat completion:", error);
        sendEvent({
          type: "error",
          content: "Failed to generate notes with OpenAI. Error: " + (error.message || "Unknown error"),
          status: "error"
        });
        const prInfo = {
          owner,
          repo,
          number: pr_number,
          title: pr_title || `PR #${pr_number}`
        };
        return res.json({
          technicalNotes: createFallbackTechnicalNotes(prInfo),
          marketingNotes: createFallbackMarketingNotes(prInfo),
          error: "OpenAI API request failed: " + (error.message || "Unknown error")
        });
      }
      let technicalBuffer = "";
      let fullContent = "";
      const hasBalancedTags = (html) => {
        const stack = [];
        let inTag = false;
        let currentTag = "";
        if (!html.trim()) return true;
        for (let i = 0; i < html.length; i++) {
          const char = html[i];
          if (char === "<") {
            inTag = true;
            currentTag = "";
          } else if (char === ">") {
            inTag = false;
            if (currentTag.startsWith("/")) {
              const tagName = currentTag.substring(1).split(/\s+/)[0];
              if (stack.length === 0 || stack.pop() !== tagName) {
                return false;
              }
            } else if (!currentTag.endsWith("/") && !currentTag.startsWith("!") && currentTag.length > 0) {
              const tagName = currentTag.split(/\s+/)[0];
              if (tagName) stack.push(tagName);
            }
          } else if (inTag) {
            currentTag += char;
          }
        }
        return !inTag && stack.length === 0;
      };
      for await (const chunk of technicalStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          const cleanedContent = content.replace(/^```html\s*/g, "").replace(/\s*```$/g, "");
          technicalBuffer += cleanedContent;
          const shouldSend = (
            // Just send content in simpler, smaller chunks
            technicalBuffer.length > 80 || // Or send when we have a complete tag (ending with >)
            technicalBuffer.includes("<") && technicalBuffer.endsWith(">")
          );
          if (shouldSend) {
            if (!technicalBuffer.includes("<")) {
              technicalBuffer = `<p>${technicalBuffer}</p>`;
            }
            sendEvent({ type: "developer", content: technicalBuffer });
            technicalBuffer = "";
          }
        }
      }
      if (technicalBuffer) {
        sendEvent({ type: "developer", content: technicalBuffer });
      }
      const finalTechnicalNotes = fullContent.replace(/```html\s*/g, "").replace(/```\s*$/g, "").replace(/```$/g, "");
      if (finalTechnicalNotes !== fullContent) {
        const resendPayload = {
          type: "developer",
          content: finalTechnicalNotes,
          resend: true
        };
        res.write(`data: ${JSON.stringify(resendPayload)}

`);
      }
      sendEvent({ type: "developer", content: "", status: "complete" });
      sendEvent({ type: "marketing", content: "", status: "start" });
      const marketingSystemPrompt = `
You are an AI assistant specialized in writing user-facing release notes for product updates derived from GitHub pull requests.

\u{1F3AF} GOAL:
Translate technical pull request changes into **engaging, easy-to-understand marketing release notes** for end users, customers, and stakeholders.

\u{1F4CC} TONE:
- Friendly, professional, and benefit-driven.
- Avoid technical jargon \u2014 explain any necessary terms simply.
- Focus on how this update helps users or improves the product.

\u{1F4CC} STRUCTURE:
Always follow this consistent HTML layout:

1. <h4>What's New</h4>
   <p>A brief summary of what was introduced or improved in this PR.</p>

2. <h4>Key Benefits</h4>
   <ul>
     <li>Describe how the update helps users (e.g., faster experience, new features, improved usability)</li>
   </ul>

3. <h4>User Impact</h4>
   <p>Explain how this will affect the user's experience \u2014 what's smoother, more intuitive, or more powerful.</p>

4. <h4>Release Notes Summary</h4>
   <ul>
     <li>Condensed bullet points summarizing the highlights</li>
   </ul>

\u2705 FORMATTING RULES:
- Use clean HTML tags: <p>, <ul>, <li>, <h4>, <strong>, etc.
- DO NOT include any markdown code fences like \`\`\`.
- Do NOT explain what you are doing \u2014 return just the formatted content.


`;
      const marketingStream = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: marketingSystemPrompt },
          {
            role: "user",
            content: `
              PR Title: ${pr_title}
              PR Number: ${pr_number}
              
              ${additionalContext ? "Additional Context:\n" + additionalContext + "\n" : ""}
              
              Developer Technical Notes:
              ${finalTechnicalNotes}
              
              Generate marketing-friendly release notes that highlight the user benefits of these changes using HTML formatting.
              IMPORTANT: Do not wrap your response in HTML code block tags (like \`\`\`html) or any markdown fences.
              IMPORTANT: Do not include \`\`\`html at the beginning or \`\`\` at the end of your response.
            `
          }
        ],
        stream: true
      });
      let marketingBuffer = "";
      let marketingFullContent = "";
      for await (const chunk of marketingStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          marketingFullContent += content;
          const cleanedContent = content.replace(/^```html\s*/g, "").replace(/\s*```$/g, "");
          marketingBuffer += cleanedContent;
          const shouldSend = (
            // Just send content in simpler, smaller chunks
            marketingBuffer.length > 80 || // Or send when we have a complete tag (ending with >)
            marketingBuffer.includes("<") && marketingBuffer.endsWith(">")
          );
          if (shouldSend) {
            if (!marketingBuffer.includes("<")) {
              marketingBuffer = `<p>${marketingBuffer}</p>`;
            }
            sendEvent({ type: "marketing", content: marketingBuffer });
            marketingBuffer = "";
          }
        }
      }
      if (marketingBuffer) {
        sendEvent({ type: "marketing", content: marketingBuffer });
      }
      const finalMarketingContent = marketingFullContent.replace(/```html\s*/g, "").replace(/```\s*$/g, "").replace(/```$/g, "");
      if (marketingFullContent !== finalMarketingContent) {
        const resendPayload = {
          type: "marketing",
          content: finalMarketingContent,
          resend: true
        };
        res.write(`data: ${JSON.stringify(resendPayload)}

`);
      }
      sendEvent({ type: "marketing", content: "", status: "complete" });
      sendEvent({ type: "done", content: "", status: "complete" });
      res.end();
    } catch (error) {
      console.error("Error generating notes:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error occurred"
        })}

`);
        res.end();
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Error generating notes"
        });
      }
    }
  });
  function createFallbackTechnicalNotes(prInfo) {
    return `
<h4>Technical Implementation Details</h4>
<p>This PR (${prInfo.title || `#${prInfo.number}`}) contains code changes that have been merged into the main branch.</p>
<p>Since OpenAI API access is not configured, this is a placeholder for AI-generated technical notes.</p>

<h4>Changed Components</h4>
<ul>
    <li><strong>Code Structure:</strong> Various files were modified following best practices</li>
    <li><strong>Documentation:</strong> Updated technical documentation to reflect changes</li>
</ul>

<h4>Testing Considerations</h4>
<p>The changes should be thoroughly tested across different environments to ensure compatibility and stability.</p>
    `;
  }
  function createFallbackMarketingNotes(prInfo) {
    return `
<h4>Feature Highlights</h4>
<p>This update (from PR ${prInfo.title || `#${prInfo.number}`}) brings improvements to our platform.</p>
<p>Since OpenAI API access is not configured, this is a placeholder for AI-generated marketing notes.</p>

<h4>Benefits</h4>
<ul>
    <li><strong>Enhanced User Experience:</strong> Improved interface and interaction flows</li>
    <li><strong>Better Performance:</strong> Faster response times and optimized resource usage</li>
    <li><strong>Greater Functionality:</strong> New capabilities that expand what users can accomplish</li>
</ul>
    `;
  }
  return server;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv from "dotenv";
import path3 from "path";
dotenv.config({ path: path3.resolve(process.cwd(), ".env") });
dotenv.config({ path: path3.resolve(process.cwd(), ".env.local") });
console.log("Environment diagnostics:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- Detected OpenAI API key:", process.env.OPENAI_API_KEY ? "\u2713 Key present" : "\u274C Key missing");
console.log("- Current directory:", process.cwd());
console.log("- Env files checked: .env and .env.local");
if (!process.env.OPENAI_API_KEY) {
  console.log("Trying to load API key from Replit secrets...");
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
