"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, GitBranch } from "lucide-react";

interface FetchPRSelectionProps {
  onFetch: () => void;
  isLoading: boolean;
  repoName?: string;
}

export function FetchPRSelection({ onFetch, isLoading, repoName = "your/repo" }: FetchPRSelectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center space-y-6 my-16"
    >
      <motion.div
        className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-inner"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 0.9, 0.8] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <GitBranch className="h-10 w-10 text-primary" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold text-gradient tracking-tight">
          Diff Digest
        </h1>
        <p className="text-muted-foreground text-base">
          Generate clean release notes instantly from your latest diffs.
        </p>
      </div>

      <motion.button
        onClick={onFetch}
        disabled={isLoading}
        aria-busy={isLoading}
        className="px-8 py-3 rounded-full bg-primary text-background hover:bg-primary/90 font-bold text-lg shadow-lg hover:shadow-2xl transition-all flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Fetching..." : "Fetch Latest Diffs"}
      </motion.button>
    </motion.section>
  );
}
