// components/PRCard.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitMerge, Clock, User, Files, ChevronRight, ExternalLink } from "lucide-react";
import { PullRequest } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";

interface PRCardProps {
  pr: PullRequest;
  onGenerateNotes: (pr: PullRequest) => void;
  isGenerating: boolean;
  isSelected: boolean;
}

export function PRCard({
  pr,
  onGenerateNotes,
  isGenerating,
  isSelected,
}: PRCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className={`
        border rounded-lg shadow-sm transition-colors duration-200 bg-card
        ${isSelected 
          ? "border-blue-400 dark:border-blue-500 ring-1 ring-blue-400 dark:ring-blue-500/30" 
          : "border-border hover:border-blue-300 dark:hover:border-blue-600/40"}
      `}>
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <GitMerge className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-card-foreground">
                {pr.title || pr.description}
              </h3>
              <p className="text-xs text-muted-foreground">
                PR #{pr.number} • {pr.url ? pr.url.split('/').slice(-2).join('/') : `#${pr.id}`}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-xs text-muted-foreground">
            {pr.mergedAt && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Merged {formatDistanceToNow(new Date(pr.mergedAt), { addSuffix: true })}</span>
              </div>
            )}
            {pr.authorName && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{pr.authorName}</span>
              </div>
            )}
            {pr.filesChanged && (
              <div className="flex items-center">
                <Files className="h-3 w-3 mr-1" />
                <span>{pr.filesChanged} {pr.filesChanged === 1 ? 'file' : 'files'} changed</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 pt-2 flex justify-between items-center border-t border-border/50">
          {pr.url && (
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View on GitHub</span>
            </a>
          )}

          <Button
            onClick={() => onGenerateNotes(pr)}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className={`${
              isGenerating && isSelected
                ? "bg-secondary text-foreground"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            {isGenerating && isSelected ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Notes</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}