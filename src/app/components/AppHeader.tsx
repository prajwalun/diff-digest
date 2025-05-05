// src/app/components/AppHeader.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest, Github, Cpu, RefreshCw, Sparkles, Zap, BookOpenCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  title?: string;
  isLoading?: boolean;
}

export function AppHeader({ title = "Diff Digest", isLoading = false }: AppHeaderProps) {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 15 }
    }
  };
  
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 dark:border-gray-800/80 glass-card">
      {/* Background elements for visual interest */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center space-x-3"
        >
          {/* Enhanced Logo with 3D effect */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 relative"
          >
            <div className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-xl blur-sm opacity-40 transform translate-y-1"></div>
            <div className="w-10 h-10 gradient-blue-bg rounded-xl shadow-lg flex items-center justify-center text-white relative">
              <GitPullRequest className="h-5 w-5" />
            </div>
          </motion.div>
          
          {/* Enhanced Brand Text with refined typography */}
          <div className="flex flex-col">
            <motion.h1
              variants={itemVariants}
              className="text-xl font-bold gradient-text-blue tracking-tight"
            >
              {title}
            </motion.h1>
            <motion.div
              variants={itemVariants}
              className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center"
            >
              <Sparkles className="h-3 w-3 mr-1 text-amber-500 dark:text-amber-400" />
              <span>AI-Powered Release Notes</span>
            </motion.div>
          </div>
          
          {/* Enhanced Version Badge */}
          <motion.div
            variants={itemVariants}
            className="ml-1 hidden sm:block"
          >
            <div className="px-2.5 py-1 text-xs rounded-full bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100/70 dark:border-blue-800/30 font-medium shadow-sm">
              <span className="flex items-center gap-1">
                <BookOpenCheck className="h-3 w-3" />
                <span>v2.0.3</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right Side Actions with enhanced visuals */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 sm:gap-4"
        >
          {/* Enhanced Loading Indicator */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading-indicator"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs font-medium bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100/70 dark:border-blue-800/30 shadow-sm overflow-hidden"
              >
                <RefreshCw className="animate-spin h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Processing...</span>
              </motion.div>
            ) : (
              <motion.div
                key="ready-indicator"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-100/70 dark:border-green-800/30 shadow-sm whitespace-nowrap overflow-hidden"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>System Ready</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Enhanced GitHub Link */}
          <motion.a
            variants={itemVariants}
            href="https://github.com/prajwalun/diff-digest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 shadow-sm border border-transparent hover:border-gray-200/80 dark:hover:border-gray-700/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </motion.a>
          
          {/* Theme Toggle */}
          <motion.div variants={itemVariants}>
            <ThemeToggle />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}