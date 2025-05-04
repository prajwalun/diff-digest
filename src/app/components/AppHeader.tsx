import * as React from "react";
import { motion } from "framer-motion";
import { GitCompare, GithubIcon } from "lucide-react";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { cn } from "../../lib/utils";

interface AppHeaderProps {
  title?: string;
  isLoading?: boolean;
}

export function AppHeader({ title = "Diff Digest", isLoading = false }: AppHeaderProps) {
  return (
    <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm sticky top-0 z-10 transition-all duration-200 border-b border-gray-100 dark:border-gray-700">
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
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              AI-Powered Release Notes
            </p>
          </div>
        </motion.div>

        <div className="flex items-center space-x-4">
          {isLoading && (
            <div className="flex items-center">
              <div className="h-2 w-2 bg-primary rounded-full mr-2 animate-ping"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Processing</span>
            </div>
          )}

          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GithubIcon className="h-5 w-5" />
          </motion.a>

          <div
            className={cn(
              "hidden md:flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-accent-foreground transition-all",
              isLoading &&
                "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground animate-pulse-slow"
            )}
          >
            {isLoading ? "Processing request..." : "Ready to generate notes"}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
