"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GitCompare, GithubIcon } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

export function AppHeader({ title = "Diff Digest", isLoading = false }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-border shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: isLoading ? Infinity : 0, duration: 1.5, ease: "linear" }}
            className="p-2 bg-primary/10 rounded-full"
          >
            <GitCompare className="w-6 h-6 text-primary drop-shadow" />
          </motion.div>
          <span className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
            {title}
          </span>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
        </div>

        <ThemeToggle />
      </div>
    </motion.header>
  );
}
