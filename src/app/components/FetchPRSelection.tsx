"use client";

import { GitPullRequest, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FetchPRSelectionProps {
  onFetch: () => void;
  isLoading: boolean;
}

export function FetchPRSelection({ onFetch, isLoading }: FetchPRSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mt-8"
    >
      <Card className="glass-card border border-yellow-500/20 dark:border-yellow-400/20 shadow-xl">
        <CardContent className="py-12 px-8 text-center relative overflow-hidden">
          {/* Animated background Git icon */}
          <motion.div
            className="absolute top-[-60px] right-[-60px] opacity-10 dark:opacity-20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
          >
            <GitPullRequest className="h-56 w-56 text-yellow-500/20 dark:text-yellow-400/10" />
          </motion.div>

          <motion.div 
            className="flex justify-center mb-6"
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30 blur-md scale-110" />
              <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-full shadow-md">
                <GitPullRequest className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gradient mb-3">Diff Digest</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Click below to fetch recently merged pull requests and generate rich AI-powered release notes.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-center"
          >
            <Button
              onClick={onFetch}
              disabled={isLoading}
              size="lg"
              className="button-primary px-6 py-3 group relative"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Fetching...
                </>
              ) : (
                <>
                  <GitPullRequest className="h-4 w-4 mr-2" />
                  Fetch Latest Diffs
                </>
              )}

              {/* Subtle shimmer effect */}
              <motion.div 
                className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-white/10"
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
