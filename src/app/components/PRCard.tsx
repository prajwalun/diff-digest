// src/app/components/PRCard.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion";
import { 
  File, FileText, GitPullRequest, User, Clock, GitBranch, 
  ArrowRight, MessageSquare, Code, Sparkles, Check, RefreshCw
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { cn } from "../../lib/utils";
import { formatDateRelative } from "../../lib/utils"; // Adjust the import path
import { PullRequest } from "../../lib/types"; // Adjust the import path

interface PRCardProps {
  pr: PullRequest;
  isGenerating: boolean;
  generatingPrId?: number | null;
  onClick: () => void;
}

export function PRCard({ pr, isGenerating, generatingPrId, onClick }: PRCardProps) {
  const isCurrentGenerating = generatingPrId === pr.id && isGenerating;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 20 }}
      key={pr.id}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      {/* Add subtle glow effect on hover */}
      <motion.div 
        className="absolute -inset-3 rounded-xl bg-blue-400/5 dark:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />

      <Card className={cn(
        "overflow-hidden transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative z-10",
        "hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md group-hover:translate-y-0"
      )}>
        <CardContent className="p-0">
          {/* PR Header Bar with Enhanced Design */}
          <div className="relative">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500"></div>
            
            <div className="pt-6 px-6 pb-5">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-4 mb-4">
                {/* PR Number and Status Section */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* PR Number with Icon - Enhanced */}
                  <div className="flex items-center gap-1.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md px-3 py-1 font-semibold text-sm border border-blue-100/70 dark:border-blue-800/30 shadow-sm">
                    <GitPullRequest className="h-4 w-4" />
                    <span>#{pr.number}</span>
                  </div>
                  
                  {/* Merged Status Badge - Enhanced */}
                  <div className="flex items-center gap-1.5 bg-purple-50/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-md px-2.5 py-1 text-xs font-semibold border border-purple-100/70 dark:border-purple-800/30 shadow-sm">
                    <GitMergeIcon className="h-3.5 w-3.5" />
                    <span>Merged</span>
                  </div>
                </div>
                
                {/* Author info - moved to middle on large screens for better layout */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-1.5 shadow-sm border border-gray-200/70 dark:border-gray-600/30">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">{pr.authorName}</span>
                  </div>
                </div>
                
                {/* Date and Files Info */}
                <div className="flex items-center gap-3 justify-end">
                  {/* Date Info - Enhanced */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDateRelative(pr.mergedAt)}</span>
                  </div>
                  
                  {/* File Count Badge - Enhanced */}
                  <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2.5 py-1 text-xs border border-gray-200/70 dark:border-gray-600/30 shadow-sm">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{pr.filesChanged} files</span>
                  </div>
                </div>
              </div>
              
              {/* PR Title with Enhanced Typography */}
              <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">
                {pr.title}
              </h3>
              
              {/* PR Description with Enhanced Styling */}
              <div className="mb-5 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg border border-gray-100/80 dark:border-gray-700/50 p-4 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                  {pr.description.length > 180 
                    ? `${pr.description.substring(0, 180)}...` 
                    : pr.description || "No description provided."}
                </p>
              </div>
              
              {/* PR Footer with Improved Layout */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center text-xs font-medium bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100/70 dark:border-blue-800/20">
                    <Code className="h-3 w-3 mr-1" />
                    Technical
                  </div>
                  <div className="inline-flex items-center text-xs font-medium bg-purple-50/70 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-100/70 dark:border-purple-800/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Features
                  </div>
                </div>
                
                {/* Generate Button with Enhanced Animation */}
                <Button
                  onClick={onClick}
                  disabled={isGenerating}
                  variant={isCurrentGenerating ? "outline" : "default"}
                  size="sm"
                  className={`relative overflow-hidden transition-all duration-300 font-medium shadow-sm ${
                    isCurrentGenerating 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' 
                      : 'gradient-blue-bg text-white hover:shadow-md'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isCurrentGenerating ? (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-1"
                      >
                        <div className="relative">
                          {/* Pulsing glow effect */}
                          <motion.div
                            className="absolute -inset-1 rounded-full bg-blue-400/20 dark:bg-blue-500/30"
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.5, 0.3] 
                            }}
                            transition={{ 
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "easeInOut" 
                            }}
                          />
                          {/* Actual spinner */}
                          <svg 
                            className="animate-spin h-4 w-4 relative" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <span className="relative">
                          <motion.span 
                            className="absolute left-0 top-0"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "linear" 
                            }}
                          >
                            Processing...
                          </motion.span>
                          <span className="opacity-0">Processing...</span>
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Generate Notes</span>
                        <motion.div
                          initial={{ x: 0, opacity: 0.5 }}
                          animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            repeatType: "loop",
                            ease: "easeInOut",
                            repeatDelay: 0.5 
                          }}
                          className="group-hover:opacity-100 opacity-0 transition-opacity duration-200"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Custom GitMerge icon with improved styling
function GitMergeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </svg>
  );
}