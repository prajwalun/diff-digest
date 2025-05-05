export interface User {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: User;
}

export interface PR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  user: User;
  diff_url: string;
  html_url?: string;
  diff_content?: string;
  _links?: {
    html?: {
      href: string;
    };
    self?: {
      href: string;
    };
  };
  base: {
    repo: Repo;
  };
}

export interface NotesData {
  developer: string;
  marketing: string;
  enrichmentStatus?: {
    inProgress: boolean;
    message: string;
    error?: string;
  };
  enrichedData?: {
    relatedIssues?: Array<{ number: number; title: string; url: string }>;
    fileStats?: {
      added: number;
      modified: number;
      removed: number;
      totalAdditions: number;
      totalDeletions: number;
      keyFiles: Array<{ name: string; additions: number; deletions: number }>;
    };
    repoStats?: {
      stars: number;
      forks: number;
      language: string;
    };
  };
}
