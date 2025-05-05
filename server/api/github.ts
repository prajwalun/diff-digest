import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function getPullRequests(req: Request, res: Response) {
  try {
    const { owner, repo } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: "Missing required parameters: owner and repo" });
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.message || `GitHub API error: ${response.status}` 
      });
    }
    
    const pullRequests = await response.json();
    return res.json({ pullRequests });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    });
  }
}

export async function getPullRequestDetails(req: Request, res: Response) {
  try {
    const { owner, repo, pull_number } = req.params;
    
    if (!owner || !repo || !pull_number) {
      return res.status(400).json({ error: "Missing required parameters: owner, repo, and pull_number" });
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.message || `GitHub API error: ${response.status}` 
      });
    }
    
    const pullRequest = await response.json();
    return res.json({ pullRequest });
  } catch (error) {
    console.error("Error fetching PR details:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    });
  }
}

export async function getPullRequestDiff(req: Request, res: Response) {
  try {
    const { owner, repo, pull_number } = req.params;
    
    if (!owner || !repo || !pull_number) {
      return res.status(400).json({ error: "Missing required parameters: owner, repo, and pull_number" });
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, {
      headers: {
        'Accept': 'application/vnd.github.v3.diff'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: errorText || `GitHub API error: ${response.status}` 
      });
    }
    
    const diffContent = await response.text();
    return res.json({ diff: diffContent });
  } catch (error) {
    console.error("Error fetching PR diff:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    });
  }
}
