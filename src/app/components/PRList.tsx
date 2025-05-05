// components/PRList.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest } from "lucide-react";
import { PullRequest } from "@/lib/types";
import { Pagination as PRPagination } from "./Pagination";
import { PRCard } from "./PRCard";

interface PRListProps {
  prs: PullRequest[];
  onGenerateNotes: (pr: PullRequest) => void;
  isGenerating: boolean;
  generatingPrId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasMorePages?: boolean;
  onFetchMore?: () => void;
  isLoadingMore?: boolean;
}

export function PRList({
  prs,
  onGenerateNotes,
  isGenerating,
  generatingPrId,
  currentPage,
  totalPages,
  onPageChange,
  hasMorePages = false,
  onFetchMore,
  isLoadingMore = false,
}: PRListProps) {
  // Display empty state when no PRs
  if (!prs || prs.length === 0) {
    return (
      <div className="text-center p-8 border border-border rounded-md bg-secondary/30">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-secondary border border-border rounded-full mx-auto flex items-center justify-center">
            <GitPullRequest className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Pull Requests Found</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          Click the "Fetch PRs" button above to retrieve pull requests from the repository.
        </p>
        <div className="inline-flex items-center font-mono text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
          <span>Ready to analyze code changes</span>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Header with modern GitHub-style */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm">
                  <GitPullRequest className="h-5 w-5" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Pull Requests
                </h2>
                
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                  {prs.length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Ready for analysis</span>
              </div>
              
              <div className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hidden md:block">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PR Cards List with staggered animations */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {prs.map((pr, index) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.08,
                ease: "easeOut" 
              }}
            >
              <PRCard
                pr={pr}
                onClick={() => onGenerateNotes(pr)}
                isGenerating={isGenerating}
                generatingPrId={generatingPrId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Pagination with better styling */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <PRPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            hasMorePages={hasMorePages}
            onFetchMore={onFetchMore}
            isLoading={isLoadingMore}
          />
        </motion.div>
      )}
    </motion.section>
  );
}