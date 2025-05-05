import axios from 'axios';

/**
 * GitHub API helper for fetching related information about PRs, issues, and contributors
 */

// Helper to set authorization if GitHub token is available
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
};

/**
 * Fetch related issues mentioned in a PR description
 */
export async function fetchRelatedIssues(owner: string, repo: string, prBody: string): Promise<any[]> {
  try {
    // Extract issue numbers from PR body (common formats like #123, fixes #123, etc.)
    const issueRegex = /(?:(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+(?:#|GH-|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#)(\d+))|(?:#|GH-|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#)(\d+)/gi;
    
    // Use a manual approach instead of matchAll for better compatibility
    const issueNumbers: number[] = [];
    let match;
    while ((match = issueRegex.exec(prBody)) !== null) {
      const issueNumber = parseInt(match[1] || match[2], 10);
      if (issueNumber && !issueNumbers.includes(issueNumber)) {
        issueNumbers.push(issueNumber);
      }
    }
    
    if (issueNumbers.length === 0) return [];
    
    // Fetch data for each issue
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
    
    return issues.filter(Boolean); // Remove any nulls from failed requests
  } catch (error) {
    console.error('Error extracting or fetching related issues:', error);
    return [];
  }
}

/**
 * Fetch key contributors to a repository
 */
export async function fetchKeyContributors(owner: string, repo: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=5`,
      { headers: getHeaders() }
    );
    
    return response.data.map((contributor: any) => ({
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      url: contributor.html_url,
      contributions: contributor.contributions
    }));
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

/**
 * Fetch files changed in a PR
 */
export async function fetchPRFiles(owner: string, repo: string, prNumber: number): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
      { headers: getHeaders() }
    );
    
    return response.data.map((file: any) => ({
      filename: file.filename,
      status: file.status, // added, modified, removed
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes
    }));
  } catch (error) {
    console.error(`Error fetching files for PR #${prNumber}:`, error);
    return [];
  }
}

/**
 * Get PR metadata including reviews, requested reviewers, and labels
 */
export async function getPRMetadata(owner: string, repo: string, prNumber: number): Promise<any> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      { headers: getHeaders() }
    );
    
    // Extract key metadata
    return {
      title: response.data.title,
      state: response.data.state,
      merged: response.data.merged,
      mergedAt: response.data.merged_at,
      author: {
        login: response.data.user.login,
        url: response.data.user.html_url
      },
      requestedReviewers: response.data.requested_reviewers?.map((reviewer: any) => ({
        login: reviewer.login,
        url: reviewer.html_url
      })) || [],
      labels: response.data.labels?.map((label: any) => ({
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

/**
 * Get summary statistics about a repository
 */
export async function getRepoStats(owner: string, repo: string): Promise<any> {
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