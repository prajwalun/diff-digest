// components/HeroBanner.tsx
"use client";

import { motion } from "framer-motion";
import { GitPullRequest, Code, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface HeroBannerProps {
  onFetch: () => void;
  isLoading: boolean;
}

export function HeroBanner({ onFetch, isLoading }: HeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden py-12 bg-gradient-to-br from-blue-50 to-background dark:from-gray-900 dark:to-background border-b border-border"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6"
        >
          <GitPullRequest className="h-4 w-4 mr-2" />
          Pull Request Analysis
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 max-w-3xl mx-auto">
          Transform PR Diffs into
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300"> Clear Release Notes</span>
        </h1>
        
        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
          Automatically generate developer-friendly and marketing-ready release notes from your GitHub pull requests.
        </p>
        
        <Button 
          onClick={onFetch}
          disabled={isLoading}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 016-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <GitPullRequest className="h-5 w-5 mr-2" />
              Analyze Repository
            </>
          )}
        </Button>
        
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-start gap-3 text-left max-w-xs">
            <div className="mt-1 p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Developer Notes</h3>
              <p className="text-sm text-muted-foreground">
                Technical details for engineers with code-level insights
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-left max-w-xs">
            <div className="mt-1 p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Marketing Notes</h3>
              <p className="text-sm text-muted-foreground">
                User-focused summaries highlighting benefits and improvements
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}