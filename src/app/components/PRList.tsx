"use client";

import { motion } from "framer-motion";
import { PullRequest } from "../../lib/types";
import { Button } from "../components/ui/button";
import {
  GithubIcon,
  Sparkles,
  Users,
  Files,
  CalendarDays,
} from "lucide-react";
import { Pagination as PRPagination } from "@/components/Pagination";
import { formatDistanceToNow } from "date-fns";

interface PRListProps {
  prs: PullRequest[];
  onGenerateNotes: (pr: PullRequest) => void;
  isGenerating: boolean;
  generatingPrId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PRList({
  prs,
  onGenerateNotes,
  isGenerating,
  generatingPrId,
  currentPage,
  totalPages,
  onPageChange,
}: PRListProps) {
  return (
    <section className="mt-16 space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-gradient tracking-tight neon-text">
            PULL REQUESTS
          </h2>
          <span className="pill bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-400">
            {prs.length} ENTRIES
          </span>
        </div>
        <span className="text-sm text-muted-foreground hidden md:block">
          Awaiting selection
        </span>
      </motion.div>

      {/* PR Cards */}
      {prs.map((pr) => (
        <motion.div
          key={pr.id}
          className="glass-card card-hover border-l-[6px] border-yellow-400 dark:border-yellow-300 transition-all"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold leading-snug mb-1">
                <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded mr-2 shadow-sm">
                  PR #{pr.number}
                </span>
                {pr.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pr.description.slice(0, 140)}
                {pr.description.length > 140 ? "..." : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {pr.mergedAt
                    ? formatDistanceToNow(new Date(pr.mergedAt)) + " ago"
                    : "Unknown"}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {pr.authorName}
                </div>
                <div className="flex items-center gap-1">
                  <Files className="w-4 h-4" />
                  {pr.filesChanged} files
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end gap-3 min-w-[160px]">
              <a
                href={pr.url}
                target="_blank"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <GithubIcon className="w-4 h-4" /> View on GitHub
              </a>
              <Button
                variant="default"
                className="button-accent w-full"
                onClick={() => onGenerateNotes(pr)}
                disabled={isGenerating && generatingPrId === pr.id}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isGenerating && generatingPrId === pr.id
                  ? "Generating..."
                  : "Generate Notes"}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Pagination */}
      <div className="mt-10">
        <PRPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}
