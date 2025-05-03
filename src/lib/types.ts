export interface DiffItem {
    id: string;
    description: string;
    diff: string;
    url: string;
  }
  
  export interface PullRequest {
    id: number;
    number: number;
    title: string;
    description: string;
    url: string;
    mergedAt: string;
    authorName: string;
    filesChanged: number;
  }
  
  export interface GeneratedNotes {
    prId: number;
    prNumber: number;
    prTitle: string;
    generatedAt: string;
    developerNotes: string;
    marketingNotes: string;
  }
  