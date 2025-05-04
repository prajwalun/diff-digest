// components/AppHeader.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitPullRequest, GithubIcon, RefreshCw } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

interface AppHeaderProps {
  title?: string;
  isLoading?: boolean;
}

export function AppHeader({ title = "Diff Digest", isLoading = false }: AppHeaderProps) {
  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and Title Section */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon Container */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-1.5 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <GitPullRequest className="h-5 w-5" />
          </div>

          <div>
            {/* Title */}
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {/* Tagline */}
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Release Notes
            </p>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
           {/* Loading Status Indicator */}
           {isLoading && (
              <motion.div
                 key="loading-status"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.3 }}
                 className="flex items-center text-sm text-muted-foreground"
              >
                 <RefreshCw className="animate-spin h-4 w-4 mr-2 text-blue-500" />
                 Processing...
              </motion.div>
           )}

           {/* Ready Status Indicator */}
           {!isLoading && (
               <motion.div
                   key="ready-status"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border font-medium hidden sm:flex items-center gap-1"
               >
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                  Ready to generate notes
               </motion.div>
           )}

          {/* GitHub Icon Link */}
          <motion.a
            href="https://github.com/prajwalun/diff-digest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View on GitHub"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GithubIcon className="w-5 h-5" />
          </motion.a>

          {/* Theme Toggle */}
          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
}