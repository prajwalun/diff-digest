import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub API routes
  app.get("/api/github/prs", async (req, res) => {
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
              return { ...pr, diff_content: diffContent };
            }
            
            return pr;
          } catch (error) {
            console.error(`Error fetching diff for PR #${pr.number}:`, error);
            return pr;
          }
        })
      );
      
      return res.json({ pullRequests: prsWithDiff });
    } catch (error) {
      console.error("Error fetching PRs:", error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      });
    }
  });

  // Notes generation API routes
  app.post("/api/notes/generate", async (req, res) => {
    try {
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
      
      // Check if OpenAI API key is available
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      const isApiKeyAvailable = !!OPENAI_API_KEY;
      
      if (!isApiKeyAvailable) {
        console.warn("OpenAI API key not found. Using fallback generated content.");
        
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
      const openai = new OpenAI.default({ apiKey: OPENAI_API_KEY });
      
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
        You are an AI assistant tasked with generating technical developer release notes from a GitHub pull request.
        
        GUIDELINES:
        - Be concise, technical, and focus on the 'what' and 'why' of the changes
        - Break down complex changes into digestible sections
        - Highlight API changes, implementation details, and technical decisions
        - Mention any performance improvements or optimizations
        - Include code snippets for significant changes when applicable
        - Format the output using HTML tags
        
        For the HTML formatting:
        - Use <h4> tags for section headers
        - Use <p> tags for paragraphs
        - Use <ul> and <li> tags for lists
        - Use <strong> tags for emphasis
        - Use <code> tags for code snippets
        
        Return ONLY the developer notes with no introduction or explanation.
        IMPORTANT: Do not wrap your response in HTML code block tags or any markdown fences.
      `;
      
      // Send start event
      sendEvent({ type: "developer", content: "", status: "start" });
      
      // Stream technical notes
      const technicalStream = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: developerSystemPrompt },
          {
            role: "user",
            content: `
              PR Title: ${pr_title}
              PR Number: ${pr_number}
              
              Diff Content:
              ${diffContent.substring(0, 30000)}  // Limiting diff size for token constraints
              
              Generate comprehensive developer notes for this pull request using HTML formatting.
              IMPORTANT: Do not wrap your response in HTML code block tags (like \`\`\`html) or any markdown fences.
            `
          }
        ],
        stream: true,
      });
      
      let technicalNotes = "";
      let fullContent = "";
      
      for await (const chunk of technicalStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Add to full content string to check for complete markdown fences
          fullContent += content;
          
          // Check and remove any ```html or ``` tags that might be included
          const cleanedContent = content
            .replace(/^```html\s*/g, '')
            .replace(/\s*```$/g, '');
          technicalNotes += cleanedContent;
          sendEvent({ type: "developer", content: cleanedContent });
        }
      }
      
      // Clean up the complete response at the end to ensure we've removed all markdown fences
      const finalTechnicalNotes = fullContent
        .replace(/```html\s*/g, '') // Remove anywhere in the text, not just beginning
        .replace(/```\s*$/g, '')    // Better handling of trailing backticks
        .replace(/```$/g, '')       // Handle backticks at the very end with no whitespace
        
      if (technicalNotes !== finalTechnicalNotes) {
        // Only update if there were actual code fences to remove
        technicalNotes = finalTechnicalNotes;
        // Optionally resend a clean version if needed
        sendEvent({ type: "developer", content: finalTechnicalNotes, resend: true });
      }
      
      // Send completion event for technical notes
      sendEvent({ type: "developer", content: "", status: "complete" });
      
      // Start marketing notes
      sendEvent({ type: "marketing", content: "", status: "start" });
      
      // Generate marketing notes
      const marketingSystemPrompt = `
        You are an AI assistant tasked with generating user-friendly marketing release notes from a GitHub pull request.
        
        GUIDELINES:
        - Focus on user benefits and business value, not technical implementation
        - Use simple, engaging language accessible to non-technical stakeholders
        - Highlight new features, improvements, and how they help users
        - Emphasize user experience enhancements and problem-solving aspects
        - Avoid technical jargon and explain any necessary technical terms
        - Format the output using HTML tags
        
        For the HTML formatting:
        - Use <h4> tags for section headers
        - Use <p> tags for paragraphs
        - Use <ul> and <li> tags for lists
        - Use <strong> tags for emphasis
        
        Return ONLY the marketing notes with no introduction or explanation.
        IMPORTANT: Do not wrap your response in HTML code block tags or any markdown fences.
      `;
      
      // Stream marketing notes
      const marketingStream = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: marketingSystemPrompt },
          {
            role: "user",
            content: `
              PR Title: ${pr_title}
              PR Number: ${pr_number}
              
              Developer Technical Notes:
              ${technicalNotes}
              
              Generate marketing-friendly release notes that highlight the user benefits of these changes using HTML formatting.
              IMPORTANT: Do not wrap your response in HTML code block tags (like \`\`\`html) or any markdown fences.
              IMPORTANT: Do not include \`\`\`html at the beginning or \`\`\` at the end of your response.
            `
          }
        ],
        stream: true,
      });
      
      let marketingFullContent = "";
      
      for await (const chunk of marketingStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Add to full content string to check for complete markdown fences
          marketingFullContent += content;
          
          // Check and remove any ```html or ``` tags that might be included
          const cleanedContent = content
            .replace(/^```html\s*/g, '')
            .replace(/\s*```$/g, '');
          sendEvent({ type: "marketing", content: cleanedContent });
        }
      }
      
      // At the end, send a cleaned-up version of the full content if necessary
      const finalMarketingContent = marketingFullContent
        .replace(/```html\s*/g, '') // Remove anywhere in the text, not just beginning
        .replace(/```\s*$/g, '')    // Better handling of trailing backticks
        .replace(/```$/g, '')       // Handle backticks at the very end with no whitespace
        
      if (marketingFullContent !== finalMarketingContent) {
        // Only resend if there were actual code fences to remove
        sendEvent({ type: "marketing", content: finalMarketingContent, resend: true });
      }
      
      // Send completion event for marketing notes and final done signal
      sendEvent({ type: "marketing", content: "", status: "complete" });
      sendEvent({ type: "done", content: "", status: "complete" });
      
      // End the response
      res.end();
      
    } catch (error) {
      console.error("Error generating notes:", error);
      
      // If streaming has already started, send error as an event
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          content: error instanceof Error ? error.message : "Unknown error occurred" 
        })}\n\n`);
        res.end();
      } else {
        // Otherwise send a regular JSON error response
        return res.status(500).json({ 
          error: error instanceof Error ? error.message : "Unknown error occurred" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to create fallback content when API key is missing
function createFallbackTechnicalNotes(prInfo: any) {
  return `<h4>Developer Notes for PR #${prInfo.number}: ${prInfo.title}</h4>

<p>This pull request contains code changes that require detailed technical review. The primary changes appear to involve functional improvements and bug fixes.</p>

<h4>Implementation Details</h4>
<ul>
  <li>Updated component structure for better maintainability</li>
  <li>Fixed edge case handling in data processing logic</li>
  <li>Improved error handling and user feedback mechanisms</li>
  <li>Enhanced type safety across the codebase</li>
</ul>

<h4>Testing Considerations</h4>
<p>The changes should be thoroughly tested across different environments to ensure compatibility and stability.</p>

<p><em>Note: These are placeholder notes. For detailed AI-generated analysis, please configure the OpenAI API key.</em></p>`;
}

function createFallbackMarketingNotes(prInfo: any) {
  return `<h4>Marketing Notes for PR #${prInfo.number}: ${prInfo.title}</h4>

<p>This update introduces new features and improvements that enhance the user experience. The main benefits include improved performance and better usability.</p>

<h4>Key Highlights</h4>
<ul>
  <li>Better visual feedback for user actions</li>
  <li>Smoother transitions between application states</li>
  <li>Enhanced navigation experience</li>
  <li>More intuitive interface elements</li>
</ul>

<h4>Customer Benefits</h4>
<p>Users will notice a more polished experience with fewer interruptions and a more intuitive workflow.</p>

<p><em>Note: These are placeholder notes. For detailed AI-generated analysis, please configure the OpenAI API key.</em></p>`;
}
