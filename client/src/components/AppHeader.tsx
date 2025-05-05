import { useTheme } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { Moon, Sun, Github, GitMerge, Sparkles, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [mountedTheme, setMountedTheme] = useState(false);
  
  // Ensures we're not doing the transition animations on mount
  useEffect(() => {
    setMountedTheme(true);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleHowItWorks = () => {
    setShowHowItWorks(!showHowItWorks);
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/30 subtle-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and brand */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary rounded-lg rotate-3"></div>
                <div className="relative z-10 text-black">
                  <GitMerge className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight gradient-text">Diff Digest</span>
                <span className="text-xs text-muted-foreground">AI-powered release notes</span>
              </div>
            </motion.div>
            
            {/* Nav links - desktop */}
            <motion.nav 
              className="hidden md:flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm hover:text-accent transition-colors rounded-md"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-sm"
                onClick={toggleHowItWorks}
              >
                <Info className="h-4 w-4 text-primary" />
                <span>How It Works</span>
              </Button>
            </motion.nav>
            
            {/* Right side actions */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Theme toggle */}
              <Button 
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 border-muted-foreground/20 relative"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>
      
      {/* How It Works Modal */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div
              className="bg-background rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-auto glass-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold gradient-text flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  How Diff Digest Works
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowHowItWorks(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl p-5 bg-highlight-purple/10 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-highlight-purple/20 flex items-center justify-center">
                      <span className="font-bold">1</span>
                    </div>
                    <h3 className="font-medium">Connect GitHub</h3>
                    <p className="text-sm text-muted-foreground">Enter the repository URL or owner/repo to fetch merged pull requests</p>
                  </div>
                  
                  <div className="rounded-xl p-5 bg-highlight-blue/10 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-highlight-blue/20 flex items-center justify-center">
                      <span className="font-bold">2</span>
                    </div>
                    <h3 className="font-medium">Select a PR</h3>
                    <p className="text-sm text-muted-foreground">Choose a merged pull request from the list to analyze its code changes</p>
                  </div>
                  
                  <div className="rounded-xl p-5 bg-highlight-green/10 space-y-3">
                    <div className="h-10 w-10 rounded-full bg-highlight-green/20 flex items-center justify-center">
                      <span className="font-bold">3</span>
                    </div>
                    <h3 className="font-medium">Generate Notes</h3>
                    <p className="text-sm text-muted-foreground">AI analyzes the PR diff to create both technical and marketing-friendly release notes</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">What makes Diff Digest special?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2 text-highlight-purple inline-block">•</span>
                      <span>Automated PR analysis that saves hours of documentation time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-highlight-blue inline-block">•</span>
                      <span>AI-powered summaries that bridge technical and non-technical audiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-highlight-green inline-block">•</span>
                      <span>Streamlined workflow for creating release notes from merged PRs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
