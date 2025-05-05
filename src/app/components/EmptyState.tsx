"use client";

import { motion } from "framer-motion";
import { 
  FileText, GitPullRequest, ChevronRight, ArrowUp, 
  Sparkles, Zap, Info, ExternalLink, Code
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  onFetch: () => void;
  isLoading?: boolean;
}

export function EmptyState({ onFetch, isLoading = false }: EmptyStateProps) {
  // Function to scroll to fetch section
  const scrollToFetchSection = () => {
    const fetchSection = document.querySelector('.fetch-pr-section');
    if (fetchSection) {
      fetchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden p-10 md:p-14 text-center border border-gray-200/80 dark:border-gray-700/50 shadow-lg glass-card">
        {/* Background design elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-grid-gray-200/40 dark:bg-grid-gray-700/15 -z-10"></div>
        <div className="absolute top-1/4 -left-10 w-40 h-40 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 -right-10 w-40 h-40 bg-purple-100/40 dark:bg-purple-900/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-lg mx-auto relative z-10">
          {/* Animated icon */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="relative flex items-center justify-center">
              {/* Pulse effect */}
              <motion.div
                className="absolute -inset-3 rounded-full bg-blue-400/20 dark:bg-blue-500/20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut" 
                }}
              />
              
              {/* Icon container */}
              <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white shadow-md">
                <GitPullRequest className="h-10 w-10" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Ready to Analyze <span className="gradient-text-blue">Pull Requests</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed text-base">
              Enter a repository above to fetch merged pull requests and generate comprehensive
              release notes powered by AI — perfect for both technical and marketing teams.
            </p>

            <div className="space-y-6">
              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
                <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200/70 dark:border-gray-700/50 shadow-sm">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/30 w-fit mb-3">
                    <Code className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Technical Details</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Developer-focused notes with code insights</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200/70 dark:border-gray-700/50 shadow-sm">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-800/30 w-fit mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Marketing Copy</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">User-friendly release highlights</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200/70 dark:border-gray-700/50 shadow-sm">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100/50 dark:border-green-800/30 w-fit mb-3">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">AI-Powered</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Intelligent analysis of code changes</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={scrollToFetchSection}
                    disabled={isLoading}
                    size="lg"
                    className="gradient-blue-bg text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-8 py-6 h-auto font-semibold text-base"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 016-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ArrowUp className="h-5 w-5 mr-2" />
                        <span>Enter Repository Above</span>
                      </div>
                    )}
                  </Button>
                </motion.div>

                <a 
                  href="https://github.com/openai/openai-node" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center"
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  <span>Try with openai/openai-node</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                </a>
              </div>

              <div className="flex justify-center">
                <div className="px-4 py-2 bg-gray-50/80 dark:bg-gray-800/70 text-xs text-gray-500 dark:text-gray-400 rounded-full border border-gray-200/70 dark:border-gray-700/50 mt-3">
                  ✨ Generate release notes in seconds instead of hours
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}