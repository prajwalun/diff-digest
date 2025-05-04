// components/EmptyState.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onFetch: () => void;
  isLoading: boolean;
}

export function EmptyState({ onFetch, isLoading }: EmptyStateProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto mt-10 max-w-4xl rounded-3xl border border-yellow-400 bg-white px-8 py-16 text-center shadow-lg dark:bg-zinc-900"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-5 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-yellow-300 blur-2xl opacity-20" />

      {/* Icon */}
      <motion.div
        className="mb-6 flex justify-center"
        initial={{ y: 0 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <div className="relative rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 p-5 shadow-lg ring-4 ring-yellow-400/30">
          <FileText className="h-6 w-6 text-black" />
          <div className="absolute inset-0 rounded-full bg-yellow-300 blur-lg opacity-10" />
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-yellow-500 mb-2">No Pull Requests Yet</h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
        Let’s get started by fetching your repository’s pull requests.
        Generate comprehensive, AI-powered release notes with just a click.
      </p>

      {/* Button */}
      <motion.button
        onClick={onFetch}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black shadow hover:bg-yellow-500 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span> Fetching...
          </>
        ) : (
          <>
            Fetch Pull Requests <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>

      {/* Footer */}
      <p className="mt-5 text-xs text-muted-foreground">
        ⚡ Powered by AI to save your time on writing release notes
      </p>
    </motion.section>
  );
}
