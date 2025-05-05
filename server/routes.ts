// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import {
  fetchRelatedIssues,
  fetchKeyContributors,
  fetchPRFiles,
  getPRMetadata,
  getRepoStats
} from "./api/github-tools";

// Import GitHub API handlers with pagination support
import { getPullRequests, getPullRequestDetails, getPullRequestDiff } from './api/github';

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // GitHub API routes with pagination support
  app.get("/api/github/prs", getPullRequests); /* Using imported handler */
  
  // Legacy GitHub API route (kept for reference)
  app.get("/api/github/prs/legacy", async (req, res) => {
    try {
      const { owner, repo } = req.query;
      
      if (!owner || !repo) {
        return res.status(400).json({ error: "Missing required parameters: owner and repo" });
      }
      
      // Fetch pull requests with more details and limit to merged ones for better quality analysis
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=20`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          error: errorData.message || `GitHub API error: ${response.status}` 
        });
      }
      
      // Get the pull requests
      let pullRequests = await response.json();
      
      // Filter only merged PRs (closed PRs that were actually merged)
      pullRequests = pullRequests.filter((pr: any) => pr.merged_at !== null);
      
      // For each PR, fetch the diff content
      const prsWithDiff = await Promise.all(
        pullRequests.map(async (pr: any) => {
          try {
            // GitHub's diff format in the header
            const diffResponse = await fetch(pr.diff_url, {
              headers: {
                'Accept': 'application/vnd.github.v3.diff'
              }
            });
            
            if (diffResponse.ok) {
              const diffContent = await diffResponse.text();
              // Add diff content to the PR object
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

  // Notes Generation Endpoint with Streaming and OpenAI integration
  app.post("/api/notes/generate", async (req, res) => {
    try {
      console.log("Starting note generation with payload:", JSON.stringify(req.body, null, 2).substring(0, 200) + "...");
      const { owner, repo, pr_number, pr_title, pr_diff, diff_content } = req.body;
      
      if (!pr_number) {
        return res.status(400).json({ 
          error: "Missing required parameter: PR number" 
        });
      }

      // Use provided diff content or fetch it if we have a URL
      let diffContent = diff_content || "";
      if (!diffContent && pr_diff) {
        try {
          const diffResponse = await fetch(pr_diff);
          diffContent = await diffResponse.text();
        } catch (error) {
          console.error("Error fetching PR diff:", error);
        }
      }
      
      // We need to use top-level imports for TypeScript
      const isApiKeyAvailable = !!process.env.OPENAI_API_KEY;
      
      console.log("OpenAI client ready:", isApiKeyAvailable ? "Yes" : "No");
      
      if (!isApiKeyAvailable) {
        console.warn("OpenAI API key not found or invalid. Using fallback generated content.");
        
        // Create prInfo object for the fallback content
        const prInfo = {
          owner,
          repo,
          number: pr_number,
          title: pr_title || `PR #${pr_number}`
        };
        
        // Return fallback content
        return res.json({
          technicalNotes: createFallbackTechnicalNotes(prInfo),
          marketingNotes: createFallbackMarketingNotes(prInfo),
          error: "OPENAI_API_KEY not found. Using fallback content."
        });
      }
      
      // If API key is available, use streaming OpenAI note generation
      const OpenAI = await import("openai");
      
      // Add detailed diagnostic logging
      console.log("API Key available for OpenAI:", !!process.env.OPENAI_API_KEY);
      console.log("API Key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
      console.log("API Key prefix:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) + "..." : "none");
      
      // Initialize OpenAI client with detailed error handling
      let openai;
      try {
        openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
        console.log("OpenAI client initialized successfully");
      } catch (error) {
        console.error("Error initializing OpenAI client:", error);
        throw error;
      }
      
      // Setup streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Stream delimiter for SSE
      const sendEvent = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      // Generate technical notes with streaming
      const developerSystemPrompt = `
You are an expert AI assistant tasked with generating **high-quality technical developer release notes** from a GitHub pull request.

🎯 GOAL:
Summarize what was changed, why it was changed, and how it was implemented. Use clean, structured HTML formatting that is visually readable when rendered on a web UI.

📌 STRUCTURE:
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

✅ FORMATTING RULES:
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
      
      // Send start event
      sendEvent({ type: "developer", content: "", status: "start" });
      
      // Fetch additional context using GitHub API tools (only if we have owner and repo)
      let additionalContext = "";
      
      if (owner && repo && pr_number) {
        try {
          // Send enrichment status to client
          sendEvent({ type: "enrichment", content: "Fetching related data...", status: "start" });
          
          // Initialize enrichment data object
          const enrichedData: any = {};
          
          // Fetch PR metadata
          const metadata = await getPRMetadata(owner, repo, parseInt(pr_number));
          if (metadata) {
            additionalContext += `\nPR Metadata:\n- Branch: ${metadata.branchName}\n- Author: ${metadata.author.login}\n`;
            
            if (metadata.labels && metadata.labels.length > 0) {
              additionalContext += `- Labels: ${metadata.labels.map((l: any) => l.name).join(", ")}\n`;
            }
          }
          
          // Fetch files changed
          const files = await fetchPRFiles(owner, repo, parseInt(pr_number));
          if (files && files.length > 0) {
            const fileStats = {
              added: files.filter((f: any) => f.status === "added").length,
              modified: files.filter((f: any) => f.status === "modified").length,
              removed: files.filter((f: any) => f.status === "removed").length,
              totalAdditions: files.reduce((sum: number, f: any) => sum + f.additions, 0),
              totalDeletions: files.reduce((sum: number, f: any) => sum + f.deletions, 0),
              keyFiles: files.slice(0, 5).map((file: any) => ({
                name: file.filename,
                additions: file.additions,
                deletions: file.deletions
              }))
            };
            
            // Add to structured enriched data
            enrichedData.fileStats = fileStats;
            
            // Add to context for LLM
            additionalContext += `\nFiles Changed (${files.length}):\n`;
            additionalContext += `- Added: ${fileStats.added}, Modified: ${fileStats.modified}, Removed: ${fileStats.removed}\n`;
            additionalContext += `- Total Additions: ${fileStats.totalAdditions}, Total Deletions: ${fileStats.totalDeletions}\n`;
            
            // Include key files in context
            additionalContext += "- Key Files:\n";
            fileStats.keyFiles.forEach((file: any) => {
              additionalContext += `  - ${file.name} (${file.additions} additions, ${file.deletions} deletions)\n`;
            });
            
            // Send file stats enrichment
            sendEvent({ 
              type: "enrichment", 
              content: "File statistics gathered", 
              status: "progress",
              data: { fileStats }
            });
          }
          
          // Fetch related issues if PR body exists
          if (metadata && pr_number) {
            sendEvent({ type: "enrichment", content: "Analyzing related issues...", status: "progress" });
            const relatedIssues = await fetchRelatedIssues(owner, repo, metadata.description || "");
            if (relatedIssues && relatedIssues.length > 0) {
              // Format for structured data
              const formattedIssues = relatedIssues.map((issue: any) => ({
                number: issue.number,
                title: issue.title,
                url: issue.html_url
              }));
              
              // Add to structured enriched data
              enrichedData.relatedIssues = formattedIssues;
              
              // Add to context
              additionalContext += `\nRelated Issues (${relatedIssues.length}):\n`;
              relatedIssues.forEach((issue: any) => {
                additionalContext += `- #${issue.number}: ${issue.title}\n`;
              });
              
              // Send related issues enrichment
              sendEvent({ 
                type: "enrichment", 
                content: "Related issues identified", 
                status: "progress",
                data: { relatedIssues: formattedIssues }
              });
            }
          }
          
          // Add repo stats
          sendEvent({ type: "enrichment", content: "Collecting repository context...", status: "progress" });
          const repoStats = await getRepoStats(owner, repo);
          if (repoStats) {
            // Add to structured enriched data
            enrichedData.repoStats = {
              stars: repoStats.stars,
              forks: repoStats.forks,
              language: repoStats.language
            };
            
            // Add to context
            additionalContext += `\nRepository Context:\n`;
            additionalContext += `- Stars: ${repoStats.stars}, Forks: ${repoStats.forks}\n`;
            additionalContext += `- Primary Language: ${repoStats.language}\n`;
            
            // Send repo stats enrichment
            sendEvent({ 
              type: "enrichment", 
              content: "Repository information collected", 
              status: "progress",
              data: { repoStats: enrichedData.repoStats }
            });
          }
          
          // Send completion status with all enriched data
          sendEvent({ 
            type: "enrichment", 
            content: "Data enrichment complete", 
            status: "complete",
            data: enrichedData
          });
        } catch (error) {
          console.error("Error fetching additional context:", error);
          sendEvent({ type: "enrichment", content: "Error fetching additional data", status: "error" });
          // Continue with base note generation even if enrichment fails
        }
      }
      
      // Stream technical notes with enriched context
      console.log("Attempting to create OpenAI chat completion with model: gpt-4o");
      let technicalStream;
      
      try {
        technicalStream = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: developerSystemPrompt },
            {
              role: "user",
              content: `
                PR Title: ${pr_title}
                PR Number: ${pr_number}
                
                ${additionalContext ? "Additional Context:\n" + additionalContext + "\n" : ""}
                Diff Content:
                ${diffContent.substring(0, 30000)}  // Limiting diff size for token constraints
                
                Generate comprehensive developer notes for this pull request using HTML formatting.
                IMPORTANT: Do not wrap your response in HTML code block tags (like \`\`\`html) or any markdown fences.
              `
            }
          ],
          stream: true,
        });
        console.log("OpenAI chat completion created successfully");
      } catch (error) {
        console.error("Error creating OpenAI chat completion:", error);
        
        // Send error to client
        sendEvent({ 
          type: "error", 
          content: "Failed to generate notes with OpenAI. Error: " + (error.message || "Unknown error"), 
          status: "error" 
        });
        
        // Create prInfo object for the fallback content
        const prInfo = {
          owner,
          repo,
          number: pr_number,
          title: pr_title || `PR #${pr_number}`
        };
        
        // Return fallback content
        return res.json({
          technicalNotes: createFallbackTechnicalNotes(prInfo),
          marketingNotes: createFallbackMarketingNotes(prInfo),
          error: "OpenAI API request failed: " + (error.message || "Unknown error")
        });
      }
      
      // Buffer to collect content before sending
      let technicalBuffer = "";
      let fullContent = "";
      
      // Helper function to check if HTML content has balanced tags
      const hasBalancedTags = (html: string) => {
        const stack: string[] = [];
        let inTag = false;
        let currentTag = "";
        
        // Skip if empty
        if (!html.trim()) return true;
        
        for (let i = 0; i < html.length; i++) {
          const char = html[i];
          
          if (char === '<') {
            inTag = true;
            currentTag = "";
          } else if (char === '>') {
            inTag = false;
            if (currentTag.startsWith('/')) {
              // Closing tag
              const tagName = currentTag.substring(1).split(/\s+/)[0]; // Get tag name
              if (stack.length === 0 || stack.pop() !== tagName) {
                return false; // Unbalanced
              }
            } else if (!currentTag.endsWith('/') && !currentTag.startsWith('!') && currentTag.length > 0) {
              // Opening tag (not self-closing, not comment)
              const tagName = currentTag.split(/\s+/)[0]; // Get tag name
              if (tagName) stack.push(tagName);
            }
          } else if (inTag) {
            currentTag += char;
          }
        }
        
        // If we're still in a tag or have unclosed tags, it's not balanced
        return !inTag && stack.length === 0;
      };
      
      for await (const chunk of technicalStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Add to full content string 
          fullContent += content;
          
          // Check and remove any ```html or ``` tags that might be included
          const cleanedContent = content
            .replace(/^```html\s*/g, '')
            .replace(/\s*```$/g, '');
          
          // Collect content in buffer
          technicalBuffer += cleanedContent;
          
          // Only send when we either have balanced tags OR enough content to make a good chunk
          // Simpler approach: send on tag boundaries or after enough content
          // This makes it more reliable without complex tag balancing
          const shouldSend = 
            // Just send content in simpler, smaller chunks
            (technicalBuffer.length > 80) || 
            // Or send when we have a complete tag (ending with >)
            (technicalBuffer.includes('<') && technicalBuffer.endsWith('>'));
          
          if (shouldSend) {
            // Add paragraph wrapper if needed - simpler check
            if (!technicalBuffer.includes('<')) {
              technicalBuffer = `<p>${technicalBuffer}</p>`;
            }
            
            // Send chunk to client
            sendEvent({ type: "developer", content: technicalBuffer });
            technicalBuffer = ""; // Reset buffer
          }
        }
      }
      
      // If there's any remaining content in the buffer, send it
      if (technicalBuffer) {
        sendEvent({ type: "developer", content: technicalBuffer });
      }
      
      // Clean up the complete response at the end to ensure we've removed all markdown fences
      const finalTechnicalNotes = fullContent
        .replace(/```html\s*/g, '') // Remove anywhere in the text, not just beginning
        .replace(/```\s*$/g, '')    // Better handling of trailing backticks
        .replace(/```$/g, '')       // Handle backticks at the very end with no whitespace
        
      // Only update and resend if there were actual code fences to remove
      if (finalTechnicalNotes !== fullContent) {
        // Send with resend flag to signal this should replace existing content
        const resendPayload = { 
          type: "developer", 
          content: finalTechnicalNotes, 
          resend: true 
        };
        // Send the event, making sure to include the resend flag as true
        res.write(`data: ${JSON.stringify(resendPayload)}\n\n`);
      }
      
      // Send completion event for technical notes
      sendEvent({ type: "developer", content: "", status: "complete" });
      
      // Start marketing notes
      sendEvent({ type: "marketing", content: "", status: "start" });
      
      // Generate marketing notes
      const marketingSystemPrompt = `
You are an AI assistant specialized in writing user-facing release notes for product updates derived from GitHub pull requests.

🎯 GOAL:
Translate technical pull request changes into **engaging, easy-to-understand marketing release notes** for end users, customers, and stakeholders.

📌 TONE:
- Friendly, professional, and benefit-driven.
- Avoid technical jargon — explain any necessary terms simply.
- Focus on how this update helps users or improves the product.

📌 STRUCTURE:
Always follow this consistent HTML layout:

1. <h4>What's New</h4>
   <p>A brief summary of what was introduced or improved in this PR.</p>

2. <h4>Key Benefits</h4>
   <ul>
     <li>Describe how the update helps users (e.g., faster experience, new features, improved usability)</li>
   </ul>

3. <h4>User Impact</h4>
   <p>Explain how this will affect the user's experience — what's smoother, more intuitive, or more powerful.</p>

4. <h4>Release Notes Summary</h4>
   <ul>
     <li>Condensed bullet points summarizing the highlights</li>
   </ul>

✅ FORMATTING RULES:
- Use clean HTML tags: <p>, <ul>, <li>, <h4>, <strong>, etc.
- DO NOT include any markdown code fences like \`\`\`.
- Do NOT explain what you are doing — return just the formatted content.


`;
      
      // Stream marketing notes with context
      const marketingStream = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
        stream: true,
      });
      
      // Buffer to collect content before sending
      let marketingBuffer = "";
      let marketingFullContent = "";
      
      for await (const chunk of marketingStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Add to full content string
          marketingFullContent += content;
          
          // Clean markdown fences
          const cleanedContent = content
            .replace(/^```html\s*/g, '')
            .replace(/\s*```$/g, '');
          
          // Collect content in buffer
          marketingBuffer += cleanedContent;
          
          // Only send when we either have balanced tags OR enough content to make a good chunk
          // Simpler approach: send on tag boundaries or after enough content
          // This makes it more reliable without complex tag balancing
          const shouldSend = 
            // Just send content in simpler, smaller chunks
            (marketingBuffer.length > 80) || 
            // Or send when we have a complete tag (ending with >)
            (marketingBuffer.includes('<') && marketingBuffer.endsWith('>'));
          
          if (shouldSend) {
            // Add paragraph wrapper if needed - simpler check
            if (!marketingBuffer.includes('<')) {
              marketingBuffer = `<p>${marketingBuffer}</p>`;
            }
            
            // Send chunk to client
            sendEvent({ type: "marketing", content: marketingBuffer });
            marketingBuffer = ""; // Reset buffer
          }
        }
      }
      
      // Send any remaining content in the buffer
      if (marketingBuffer) {
        sendEvent({ type: "marketing", content: marketingBuffer });
      }
      
      // At the end, send a cleaned-up version of the full content if necessary
      const finalMarketingContent = marketingFullContent
        .replace(/```html\s*/g, '') // Remove anywhere in the text, not just beginning
        .replace(/```\s*$/g, '')    // Better handling of trailing backticks
        .replace(/```$/g, '')       // Handle backticks at the very end with no whitespace
        
      if (marketingFullContent !== finalMarketingContent) {
        // Send with resend flag to signal this should replace existing content
        const resendPayload = { 
          type: "marketing", 
          content: finalMarketingContent, 
          resend: true 
        };
        // Send the event, making sure to include the resend flag as true
        res.write(`data: ${JSON.stringify(resendPayload)}\n\n`);
      }
      
      // Send completion event for marketing notes and final done signal
      sendEvent({ type: "marketing", content: "", status: "complete" });
      sendEvent({ type: "done", content: "", status: "complete" });
      
      // End the response
      res.end();
      
    } catch (error) {
      console.error("Error generating notes:", error);
      
      if (res.headersSent) {
        // If we've already started streaming, send an error event
        res.write(`data: ${JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error occurred"
        })}\n\n`);
        res.end();
      } else {
        // If headers haven't been sent yet, send a regular JSON error response
        res.status(500).json({
          error: error instanceof Error ? error.message : "Error generating notes"
        });
      }
    }
  });

  // Fallback content generation for when OpenAI API key is not available
  function createFallbackTechnicalNotes(prInfo: any) {
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

  function createFallbackMarketingNotes(prInfo: any) {
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