// components/HeroBanner.tsx
"use client";

import { motion } from "framer-motion";
import { 
  GitPullRequest, Code, FileText, Zap, ArrowRight, 
  Sparkles, MessageSquareCode, Github, CheckCircle 
} from "lucide-react";
import { Button } from "./ui/button";

interface HeroBannerProps {
  onFetch: () => void;
  isLoading: boolean;
}

export function HeroBanner({ onFetch, isLoading }: HeroBannerProps) {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
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
    <div className="relative overflow-hidden">
      {/* Hero gradient background with enhanced visuals */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-blue-50/50 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-900 -z-10"></div>
      
      {/* Decorative elements with improved positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Gradient orbs with better positioning and opacity */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
        
        {/* Grid pattern with better opacity and masking */}
        <div className="absolute inset-0 bg-grid-gray-200/40 dark:bg-grid-gray-700/15 [mask-image:linear-gradient(to_bottom,transparent,20%,white,80%,transparent)]"></div>
        
        {/* Animated accent line at top */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="absolute top-0 inset-x-0 h-1 gradient-blue-bg"
        ></motion.div>
      </div>
      
      {/* Main content with enhanced layout */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Product Badge */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md border border-blue-100/50 dark:border-blue-900/30">
              <GitPullRequest className="h-4 w-4 mr-2" />
              <span className="gradient-text-blue font-bold">GitHub Pull Request Analysis</span>
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full text-xs font-semibold">New</span>
            </div>
          </motion.div>
          
          {/* Main Heading with improved typography */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Transform PR Diffs into
              <span className="gradient-text-blue block sm:inline"> Clear Release Notes</span>
            </h1>
          </motion.div>
          
          {/* Subtitle with improved readability */}
          <motion.p
            variants={itemVariants}
            className="text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed text-center"
          >
            Automatically generate dual-purpose release notes from GitHub pull requests - 
            detailed technical notes for developers and clear summaries for marketing teams.
          </motion.p>
          
          {/* Action Buttons with enhanced styling */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              onClick={onFetch}
              disabled={isLoading}
              size="lg"
              className="gradient-blue-bg text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-8 py-6 h-auto font-semibold text-base group"
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
                  <Zap className="h-5 w-5 mr-2" />
                  <span>Get Started Now</span>
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
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </motion.div>
                </div>
              )}
            </Button>
            
            <a 
              href="https://github.com/prajwalun/diff-digest"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card inline-flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-medium transition-all text-sm shadow-md hover:shadow-lg"
            >
              <Github className="h-5 w-5 mr-2.5 text-gray-500 dark:text-gray-400" />
              <span>View on GitHub</span>
            </a>
          </motion.div>
          
          {/* Feature cards with enhanced design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card flex flex-col items-start text-left p-6 md:p-8 rounded-xl shadow-md overflow-hidden relative group"
            >
              {/* Accent line with animated gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500"></div>
              
              {/* Icon with enhanced styling */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5 shadow-sm border border-blue-100 dark:border-blue-900/20 group-hover:scale-110 transition-transform duration-200">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Developer Notes</h3>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                Technical details with code-level insights, implementation specifics, and architectural changes that engineering teams need.
              </p>
              
              <div className="mt-auto space-y-2 w-full">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">API changes and interfaces</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Performance implications</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Breaking changes highlighted</p>
                </div>
              </div>
              
              <div className="mt-6">
                <span className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full shadow-sm border border-blue-100 dark:border-blue-900/20">
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  Code-focused
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card flex flex-col items-start text-left p-6 md:p-8 rounded-xl shadow-md overflow-hidden relative group"
            >
              {/* Accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-500"></div>
              
              {/* Icon with enhanced styling */}
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-5 shadow-sm border border-purple-100 dark:border-purple-900/20 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="h-6 w-6" />
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Marketing Notes</h3>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                User-friendly summaries highlighting benefits, improvements, and new features ready for customer communications.
              </p>
              
              <div className="mt-auto space-y-2 w-full">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Customer-facing benefits</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Feature highlights explained</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Non-technical language</p>
                </div>
              </div>
              
              <div className="mt-6">
                <span className="inline-flex items-center text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full shadow-sm border border-purple-100 dark:border-purple-900/20">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  User-focused
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}