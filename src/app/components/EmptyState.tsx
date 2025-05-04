"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, GitPullRequest, ChevronRight, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  onFetch: () => void;
}

export function EmptyState({ onFetch }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
    >
      <Card className="glass-card p-10 md:p-16 text-center relative overflow-hidden border-dashed border-2">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <motion.div 
            className="absolute top-10 left-10 opacity-5 dark:opacity-10"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          >
            <GitMerge className="h-64 w-64 text-primary" />
          </motion.div>

          <motion.div 
            className="absolute -bottom-20 -right-16 opacity-5 dark:opacity-10"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
          >
            <GitPullRequest className="h-72 w-72 text-secondary" />
          </motion.div>
        </div>

        {/* Foreground content */}
        <div className="max-w-md mx-auto relative z-10">
          <motion.div 
            className="flex justify-center mb-8 relative"
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="relative flex items-center justify-center z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-md scale-110"></div>
              <div className="p-5 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg">
                <FileText className="h-10 w-10 text-black dark:text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gradient mb-3">
              No Pull Requests Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto leading-relaxed">
              Let's get started by fetching your repository's pull requests.
              Generate comprehensive release notes with just a click.
            </p>

            <div className="space-y-5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-center"
              >
                <Button
                  onClick={onFetch}
                  size="lg"
                  className="button-primary px-8 py-6 text-base group relative z-10"
                >
                  <span>Fetch Pull Requests</span>
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />

                  {/* Subtle highlight effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-white/10"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </Button>
              </motion.div>

              <p className="text-xs text-muted-foreground z-10 relative">
                Powered by AI to save your time on writing release notes
              </p>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
