// components/FetchPRsSection.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, GitBranch, Search, GitPullRequest } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FetchPRsSectionProps {
  onFetch: (owner?: string, repo?: string) => void;
  isLoading: boolean;
  repoName?: string;
  hasPRs?: boolean;
}

export function FetchPRsSection({
  onFetch,
  isLoading,
  repoName = "openai/openai-node",
  hasPRs = false,
}: FetchPRsSectionProps) {
  const [repo, setRepo] = React.useState(repoName);
  const [owner, setOwner] = React.useState("");
  const [repoInput, setRepoInput] = React.useState("");

  // Parse owner and repo on component mount and when repoName changes
  React.useEffect(() => {
    if (repoName && repoName.includes('/')) {
      const [ownerPart, repoPart] = repoName.split('/');
      setOwner(ownerPart);
      setRepo(repoPart);
      setRepoInput(repoName);
    }
  }, [repoName]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the input to get owner and repo
    const parts = repoInput.trim().split('/');
    let newOwner = owner;
    let newRepo = repo;
    
    if (parts.length === 2) {
      [newOwner, newRepo] = parts;
    } else if (parts.length === 1) {
      newRepo = parts[0];
    }
    
    if (newOwner && newRepo) {
      onFetch(newOwner, newRepo);
    }
  };

  return (
    <div className="mt-4 sm:mt-8 mb-8">
      <div className="mx-auto max-w-3xl">
        {!hasPRs && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <GitPullRequest className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              PR Diff Analysis
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Enter a GitHub repository to fetch its merged pull requests. 
              We'll analyze the diffs and generate detailed release notes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto px-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="openai/openai-node"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              className="pl-9 pr-4 py-2 h-10 w-full"
              disabled={isLoading}
              aria-label="Repository name"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-t-transparent" />
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !repoInput.includes('/')}
            className={cn(
              "h-10 px-4 text-sm font-medium transition-colors",
              hasPRs 
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            )}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span>{hasPRs ? "Fetching..." : "Please wait..."}</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                <span>{hasPRs ? "Fetch PRs" : "Analyze Repository"}</span>
              </>
            )}
          </Button>
        </form>
        
        {!hasPRs && (
          <div className="mt-4 flex items-center justify-center">
            <div className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border bg-secondary/50">
              <div className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
              Ready to analyze public repositories
            </div>
          </div>
        )}
      </div>
    </div>
  );
}