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
        return res.status(400).json({ error: "Missing owner/repo" });
      }
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=20`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "GitHub API error" });
      }
      const pullRequests = (await response.json()).filter((pr) => pr.merged_at);
      const prsWithDiff = await Promise.all(
        pullRequests.map(async (pr) => {
          try {
            const diffResponse = await fetch(pr.diff_url, {
              headers: { "Accept": "application/vnd.github.v3.diff" }
            });
            if (diffResponse.ok) {
              const diffContent = await diffResponse.text();
              return { ...pr, diff_content: diffContent };
            }
            return pr;
          } catch (e) {
            return pr;
          }
        })
      );
      res.json({ pullRequests: prsWithDiff });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch PRs" });
    }
  });
  app2.post("/api/notes/generate", async (req, res) => {
    try {
      const { owner, repo, pr_number, pr_title, pr_diff, diff_content } = req.body;
      if (!pr_number) return res.status(400).json({ error: "Missing PR number" });
      let diffContent = diff_content || "";
      if (!diffContent && pr_diff) {
        const r = await fetch(pr_diff);
        diffContent = await r.text();
      }
      const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}

`);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      if (!process.env.OPENAI_API_KEY) {
        return res.json({
          technicalNotes: createFallbackTechnicalNotes({ owner, repo, number: pr_number, title: pr_title }),
          marketingNotes: createFallbackMarketingNotes({ owner, repo, number: pr_number, title: pr_title }),
          error: "Missing OPENAI_API_KEY"
        });
      }
      const OpenAI = await import("openai");
      const openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
      let additionalContext = "";
      const metadata = await getPRMetadata(owner, repo, parseInt(pr_number));
      const files = await fetchPRFiles(owner, repo, parseInt(pr_number));
      const repoStats = await getRepoStats(owner, repo);
      const relatedIssues = await fetchRelatedIssues(owner, repo, metadata?.description || "");
      if (metadata) {
        additionalContext += `Author: ${metadata.author.login}, Branch: ${metadata.branchName}
`;
      }
      if (files?.length) {
        additionalContext += `Files changed: ${files.length}
`;
        additionalContext += files.slice(0, 5).map((f) => `- ${f.filename}`).join("\n");
      }
      if (repoStats) {
        additionalContext += `
Stars: ${repoStats.stars}, Forks: ${repoStats.forks}, Language: ${repoStats.language}`;
      }
      if (relatedIssues?.length) {
        additionalContext += `
Related Issues:
` + relatedIssues.map((i) => `#${i.number}: ${i.title}`).join("\n");
      }
      sendEvent({ type: "developer", content: "", status: "start" });
      const devStream = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: [
          {
            role: "system",
            content: "Generate HTML developer notes. Structure with <h4>, <ul>, <p>, <code>. No markdown."
          },
          {
            role: "user",
            content: `
PR Title: ${pr_title}
PR Number: ${pr_number}
${additionalContext}
Diff:
${diffContent.slice(0, 3e4)}`
          }
        ]
      });
      let fullDevContent = "";
      for await (const chunk of devStream) {
        const c = chunk.choices[0]?.delta?.content || "";
        fullDevContent += c;
        sendEvent({ type: "developer", content: c });
      }
      sendEvent({ type: "developer", content: "", status: "complete" });
      sendEvent({ type: "marketing", content: "", status: "start" });
      const mktStream = await openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        messages: [
          {
            role: "system",
            content: "Create marketing-friendly HTML notes. Format using <h4>, <ul>, <p>. Avoid tech jargon."
          },
          {
            role: "user",
            content: `
PR Title: ${pr_title}
PR Number: ${pr_number}
${additionalContext}
Developer Notes:
${fullDevContent}`
          }
        ]
      });
      for await (const chunk of mktStream) {
        const c = chunk.choices[0]?.delta?.content || "";
        sendEvent({ type: "marketing", content: c });
      }
      sendEvent({ type: "marketing", content: "", status: "complete" });
      sendEvent({ type: "done", status: "complete" });
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Streaming failed" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", content: error.message || "Unknown error" })}

`);
        res.end();
      }
    }
  });
  function createFallbackTechnicalNotes(prInfo) {
    return `<h4>Technical Overview</h4><p>This PR (${prInfo.title}) modifies code and improves functionality. Fallback content provided.</p>`;
  }
  function createFallbackMarketingNotes(prInfo) {
    return `<h4>What's New</h4><p>This update enhances the user experience and adds new features. Fallback content used.</p>`;
  }
  return server;
}

// server/vite.ts
import { fileURLToPath } from "url";
import path2 from "path";
import express from "express";
import fs from "fs";
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
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path2.dirname(__filename);
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
    allowedHosts: ["*"]
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
        __dirname2,
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
  const distPath = path2.resolve(__dirname2, "public");
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
