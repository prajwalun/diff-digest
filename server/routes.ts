// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import {
  fetchRelatedIssues,
  fetchKeyContributors,
  fetchPRFiles,
  getPRMetadata,
  getRepoStats
} from "./api/github-tools";
import {
  getPullRequests,
  getPullRequestDetails,
  getPullRequestDiff
} from './api/github';

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // GitHub PR list endpoint (new)
  app.get("/api/github/prs", getPullRequests);

  // GitHub legacy PR route
  app.get("/api/github/prs/legacy", async (req, res) => {
    try {
      const { owner, repo } = req.query;
      if (!owner || !repo) {
        return res.status(400).json({ error: "Missing owner/repo" });
      }
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=20`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "GitHub API error" });
      }
      const pullRequests = (await response.json()).filter((pr: any) => pr.merged_at);
      const prsWithDiff = await Promise.all(
        pullRequests.map(async (pr: any) => {
          try {
            const diffResponse = await fetch(pr.diff_url, {
              headers: { 'Accept': 'application/vnd.github.v3.diff' }
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

  // Streaming Notes Generator
  app.post("/api/notes/generate", async (req, res) => {
    try {
      const { owner, repo, pr_number, pr_title, pr_diff, diff_content } = req.body;

      if (!pr_number) return res.status(400).json({ error: "Missing PR number" });

      let diffContent = diff_content || "";
      if (!diffContent && pr_diff) {
        const r = await fetch(pr_diff);
        diffContent = await r.text();
      }

      const sendEvent = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`);

      // Streaming headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

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
        additionalContext += `Author: ${metadata.author.login}, Branch: ${metadata.branchName}\n`;
      }
      if (files?.length) {
        additionalContext += `Files changed: ${files.length}\n`;
        additionalContext += files.slice(0, 5).map(f => `- ${f.filename}`).join("\n");
      }
      if (repoStats) {
        additionalContext += `\nStars: ${repoStats.stars}, Forks: ${repoStats.forks}, Language: ${repoStats.language}`;
      }
      if (relatedIssues?.length) {
        additionalContext += `\nRelated Issues:\n` + relatedIssues.map(i => `#${i.number}: ${i.title}`).join("\n");
      }

      // Developer Notes
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
${diffContent.slice(0, 30000)}`
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

      // Marketing Notes
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
        res.status(500).json({ error: (error as Error).message || "Streaming failed" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", content: (error as Error).message || "Unknown error" })}\n\n`);
        res.end();
      }
    }
  });

  function createFallbackTechnicalNotes(prInfo: any) {
    return `<h4>Technical Overview</h4><p>This PR (${prInfo.title}) modifies code and improves functionality. Fallback content provided.</p>`;
  }

  function createFallbackMarketingNotes(prInfo: any) {
    return `<h4>What's New</h4><p>This update enhances the user experience and adds new features. Fallback content used.</p>`;
  }

  return server;
}
