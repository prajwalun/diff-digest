export interface PullRequest {
  id: number;
  number: number;
  title: string;
  description: string;
  diff: string;
  url: string;
  authorName: string;
  filesChanged: number;
  mergedAt: string; // Assuming this is the merge date string
}

// Added: Interface for the generated notes data
export interface GeneratedNotes {
  developerNotes: string;
  marketingNotes: string;
  // Optional properties that might be included in the generated notes data
  prTitle?: string;
  prNumber?: number;
  generatedAt?: string;
  prId?: number;
}