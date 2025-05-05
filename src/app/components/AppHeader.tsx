"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitPullRequest, ExternalLink, Github, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "./ThemeToggle"; // Import your separate ThemeToggle component

interface AppHeaderProps {
  title?: string;
  isLoading?: boolean;
}

export function AppHeader({ title = "Diff Digest", isLoading = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
      <div className="flex h-16 items-center px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Logo and title */}
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 15, transition: { type: "spring", stiffness: 400 } }}
              className="flex items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-1"
            >
              <GitPullRequest className="h-6 w-6 text-white" />
            </motion.div>
            
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </span>

            {isLoading && (
              <div className="flex items-center ml-2">
                <div className="animate-spin text-blue-500 dark:text-blue-400">
                  <RefreshCw className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Use your separate ThemeToggle component */}
            <ThemeToggle />
            
            {/* GitHub link */}
            <a 
              href="https://github.com/openai/openai-node" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center size-9 rounded-md text-gray-700 dark:text-gray-300",
                "hover:bg-gray-200/70 dark:hover:bg-gray-800/70"
              )}
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}