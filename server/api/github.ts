import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function getPullRequests(req: Request, res: Response) {
  try {
    const { owner, repo, page = "1", per_page = "10" } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: "Missing required parameters: owner and repo" });
    }
    
    // Convert to numbers and set defaults
    const pageNum = parseInt(page as string, 10) || 1;
    const perPageNum = parseInt(per_page as string, 10) || 10;
    
    // Ensure reasonable limits (GitHub allows max 100 per page)
    const sanitizedPerPage = Math.min(Math.max(perPageNum, 5), 100);
    
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&page=${pageNum}&per_page=${sanitizedPerPage}`;
    const response = await fetch(url);
    
    // Check if there's a next page from Link header
    const linkHeader = response.headers.get('Link');
    const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : false;
    const hasPrevPage = linkHeader ? linkHeader.includes('rel="prev"') : false;
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.message || `GitHub API error: ${response.status}` 
      });
    }
    
    const pullRequests = await response.json();
    
    // Get total count if we need it
    let totalCount = null;
    try {
      const countResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (countResponse.ok) {
        const repoData = await countResponse.json();
        totalCount = repoData.open_issues_count; // This is not exact but gives an estimate
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
