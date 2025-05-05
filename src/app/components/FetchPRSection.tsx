// src/app/components/FetchPRSection.tsx 
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitPullRequest, ArrowRight, Search } from "lucide-react";
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
  repoName,
  hasPRs = false,
}: FetchPRsSectionProps) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (owner.trim() && repo.trim()) {
      onFetch(owner.trim(), repo.trim());
    } else {
      // Use default values if fields are empty
      onFetch();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8 sm:px-6 md:py-12"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-5">
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">PR Diff Analysis</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter a GitHub repository to fetch its merged pull requests. We'll analyze the diffs and generate detailed release notes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="username/repository"
                  value={owner.length > 0 && repo.length > 0 ? `${owner}/${repo}` : ""}
                  onChange={(e) => {
                    const [newOwner, newRepo] = e.target.value.split('/');
                    setOwner(newOwner || "");
                    setRepo(newRepo || "");
                  }}
                  className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 h-11"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <Button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700 h-11 px-6 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Analyze Repository
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className="inline-flex rounded-full h-2 w-2 bg-green-400 mr-2"></span>
              Ready to analyze public repositories
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}