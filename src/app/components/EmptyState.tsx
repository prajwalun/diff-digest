// components/EmptyState.tsx
"use client";

import { motion } from "framer-motion";
import { FileText, GitPullRequest, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  onFetch: () => void;
  isLoading?: boolean;
}

export function EmptyState({ onFetch, isLoading = false }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden p-10 md:p-12 text-center border-dashed border-2 border-border">
        <div className="max-w-md mx-auto relative z-10">
          <motion.div
            className="flex justify-center mb-8"
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="relative flex items-center justify-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GitPullRequest className="h-8 w-8" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No Pull Requests Yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Let's get started by fetching your repository's pull requests. Generate comprehensive
              release notes with just a click.
            </p>

            <div className="space-y-5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-center"
              >
                <Button
                  onClick={onFetch}
                  disabled={isLoading}
                  size="lg"
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 016-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Fetching...
                    </>
                  ) : (
                    <>
                      <span>Fetch Pull Requests</span>
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-muted-foreground font-medium">
                ✨ Powered by AI to save your time on writing release notes
              </p>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}