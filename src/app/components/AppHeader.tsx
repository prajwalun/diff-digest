// components/AppHeader.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitCompare, GithubIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "../../lib/utils";

interface AppHeaderProps {
  title?: string;
  isLoading?: boolean;
}

export function AppHeader({ title = "Diff Digest", isLoading = false }: AppHeaderProps) {
  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-md sticky top-0 z-20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-1.5 shadow-md">
            <GitCompare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Release Notes
            </p>
          </div>
        </motion.div>

        <div className="flex items-center space-x-4">
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground animate-pulse">
              <div className="h-2 w-2 bg-primary rounded-full mr-2 animate-ping"></div>
              Processing...
            </div>
          )}

          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GithubIcon className="h-5 w-5" />
          </motion.a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
