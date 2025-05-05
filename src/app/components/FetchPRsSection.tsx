// components/FetchPRsSection.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, GitBranch, Search, GitPullRequest, ExternalLink, ChevronRight, Zap } from "lucide-react";
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
  const [isFocused, setIsFocused] = React.useState(false);

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

  const inputBorderClass = isFocused
    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30"
    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  return (
    <section className="mt-6 mb-10">
      <div className="max-w-3xl mx-auto px-4">
        {!hasPRs && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-400/20 dark:bg-blue-500/20"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0, 0.7]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Icon container */}
                <div className="relative p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-md">
                  <GitPullRequest className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
            >
              GitHub PR Analysis
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm leading-relaxed"
            >
              Enter a GitHub repository to fetch its merged pull requests. 
              We'll analyze the code changes and generate comprehensive release notes for both technical and marketing teams.
            </motion.p>
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className={cn(
            "sm:flex-row gap-3 max-w-2xl mx-auto",
            hasPRs ? "flex items-center" : "flex flex-col sm:flex-row"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasPRs ? 0 : 0.5, duration: 0.5 }}
        >
          <div className={cn(
            "relative flex-grow",
            hasPRs ? "w-full" : "mb-3 sm:mb-0"
          )}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <GitBranch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            
            <Input
              type="text"
              placeholder="organization/repository-name"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "pl-10 pr-4 py-3 h-11 w-full bg-white dark:bg-gray-800 transition-all duration-200",
                inputBorderClass,
                isLoading ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"
              )}
              disabled={isLoading}
              aria-label="Repository name"
            />
            
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="h-5 w-5 animate-spin text-blue-500 dark:text-blue-400">
                  <RefreshCw className="h-full w-full" />
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !repoInput.includes('/')}
            className={cn(
              "h-11 px-5 font-medium transition-all duration-200 shadow-sm",
              hasPRs 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            )}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span>{hasPRs ? "Fetching..." : "Processing..."}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  {hasPRs ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span>Refresh PRs</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      <span>Analyze Repository</span>
                      <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.form>
        
        {!hasPRs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Ready to analyze public repositories
            </div>
            
            <a 
              href="https://github.com/openai/openai-node" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/10 flex items-center transition-colors duration-200"
            >
              <Zap className="h-3 w-3 mr-1.5" />
              Try with openai/openai-node
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}