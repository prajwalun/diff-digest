// components/AppHeader.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { GithubIcon, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "../../lib/utils";

export function AppHeader() {
  return (
    <header className="bg-background/90 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-full p-2 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-glow animate-pulse">
            <Zap className="w-6 h-6 text-black drop-shadow-md" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-gradient tracking-tight neon-text">
              DIFFDIGEST
            </h1>
            <p className="text-xs text-muted-foreground">
              AI-Powered Release Notes
            </p>
          </div>
        </motion.div>

        {/* Right Side: GitHub, Status, Theme */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium tracking-wide border border-border hidden md:block">
            Ready to generate notes
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>

          <ThemeToggle />
        </motion.div>
      </div>
    </header>
  );
}
