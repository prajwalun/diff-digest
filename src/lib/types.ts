
export interface PullRequest {
  id: number;
  number: number;
  title: string;
  description: string;
  diff: string; 
  url: string;
  authorName: string;
  filesChanged: number;
  mergedAt: string;
}
