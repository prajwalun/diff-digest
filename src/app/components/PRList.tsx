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
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      {/* Header with GitHub-style */}
      <div className="mb-6">
        <div className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Pull Requests
              </h2>
              <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {prs.length}
              </span>
            </div>
            <div className="text-sm text-muted-foreground font-medium hidden md:flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Ready for analysis
            </div>
          </div>
        </div>
      </div>

      {/* PR Cards List with item animations */}
      <div className="space-y-3">
        <AnimatePresence mode="sync">
          {prs.map((pr, index) => (
            <PRCard
              key={pr.id}
              pr={pr}
              onGenerateNotes={onGenerateNotes}
              isGenerating={isGenerating}
              isSelected={generatingPrId === pr.id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination with fetch more option */}
      <div className="mt-8">
        <PRPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          hasMorePages={hasMorePages}
          onFetchMore={onFetchMore}
          isLoading={isLoadingMore}
        />
      </div>
    </motion.section>
  );
}