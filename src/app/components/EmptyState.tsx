// components/EmptyState.tsx
"use client";

import { motion } from "framer-motion";
import { 
  FileText, GitPullRequest, ChevronRight, Search, 
  ArrowRight, BrainCircuit, FileCode, RefreshCw,
  Sparkles, Zap, Cpu, RocketIcon
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  onFetch: () => void;
  isLoading?: boolean;
}

export function EmptyState({ onFetch, isLoading = false }: EmptyStateProps) {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-8"
    >
      <Card className="relative overflow-hidden p-12 md:p-16 text-center glass-card border border-gray-200/80 dark:border-gray-700/50 shadow-lg rounded-2xl">
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top gradient accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500"></div>
          
          {/* Enhanced gradient orbs with better positioning */}
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
          
          {/* Grid pattern with better opacity and masking */}
          <div className="absolute inset-0 bg-grid-gray-200/30 dark:bg-grid-gray-700/10 [mask-image:linear-gradient(to_bottom,transparent,20%,white,80%,transparent)]"></div>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl mx-auto relative z-10"
        >
          {/* Animated icon with enhanced 3D effect */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-10"
            whileHover={{ scale: 1.05, rotateZ: 5 }}
          >
            <div className="relative flex items-center justify-center">
              {/* Enhanced animated rings */}
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-blue-200/60 dark:border-blue-800/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8], 
                  opacity: [0.3, 0.6, 0.3] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
              />
              
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-blue-300/60 dark:border-blue-700/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [0.9, 1.3, 0.9], 
                  opacity: [0.4, 0.7, 0.4] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4.5, 
                  ease: "easeInOut",
                  delay: 0.3
                }}
              />
              
              {/* Shadow blob for 3D effect */}
              <div className="absolute inset-0 bg-blue-600/30 dark:bg-blue-700/30 rounded-full blur-lg transform translate-y-2 scale-90"></div>
              
              {/* Enhanced icon container with gradient */}
              <div className="relative p-6 gradient-blue-bg rounded-2xl flex items-center justify-center text-white shadow-xl">
                <GitPullRequest className="h-10 w-10" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-4 tracking-tight gradient-text-blue">
              Ready to Generate Notes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Generate comprehensive, dual-purpose release notes from your GitHub pull requests with AI-powered insights.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Enhanced primary action button */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex justify-center"
            >
              <Button
                onClick={onFetch}
                disabled={isLoading}
                size="lg"
                className="relative overflow-hidden gradient-blue-bg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-6 h-auto border border-blue-400/20 dark:border-blue-600/20 text-base"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 text-white/90" />
                      <span>Fetching Pull Requests...</span>
                    </>
                  ) : (
                    <>
                      <RocketIcon className="h-5 w-5 text-white/90" />
                      <span>Start Generating Release Notes</span>
                      <motion.div
                        initial={{ x: 0, opacity: 0.7 }}
                        animate={{ x: [0, 5, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5,
                          repeatType: "loop",
                          ease: "easeInOut" 
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>

            {/* Enhanced features section with cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:shadow-md text-left flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500"></div>
                <div className="flex-shrink-0 p-2.5 bg-blue-50/80 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mb-3 shadow-sm border border-blue-100/70 dark:border-blue-900/20 group-hover:scale-110 transition-transform duration-200">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Developer Notes</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Detailed technical documentation with code insights and implementation details.
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:shadow-md text-left flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-500"></div>
                <div className="flex-shrink-0 p-2.5 bg-purple-50/80 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mb-3 shadow-sm border border-purple-100/70 dark:border-purple-900/20 group-hover:scale-110 transition-transform duration-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Marketing Notes</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  User-friendly summaries highlighting benefits and features for communications.
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:shadow-md text-left flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-500"></div>
                <div className="flex-shrink-0 p-2.5 bg-green-50/80 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mb-3 shadow-sm border border-green-100/70 dark:border-green-900/20 group-hover:scale-110 transition-transform duration-200">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Smart insights extraction from code changes with intelligent categorization.
                </p>
              </div>
            </motion.div>
            
            {/* Enhanced status indicator */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50/80 dark:bg-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700/40 shadow-sm">
                <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                <span>System ready for GitHub integration</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}