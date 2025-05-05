import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPRs } from "@/lib/github";
import { RefreshCw, Github, Search, GitMerge, AlertCircle } from "lucide-react";
import { PR } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { motion, AnimatePresence } from "framer-motion";

interface FetchPRSectionProps {
  repoInfo: { owner: string; repo: string } | null;
  setRepoInfo: (info: { owner: string; repo: string } | null) => void;
  setPRs: (prs: PR[]) => void;
  setSelectedPR: (pr: PR | null) => void;
  setIsLoadingPRs: (loading: boolean) => void;
  isLoadingPRs: boolean;
  setError: (error: string | null) => void;
}

// Sample popular repos for quick access
const POPULAR_REPOS = [
  { name: "React", url: "facebook/react" },
  { name: "Next.js", url: "vercel/next.js" },
  { name: "TypeScript", url: "microsoft/typescript" },
  { name: "Tailwind CSS", url: "tailwindlabs/tailwindcss" }
];

export default function FetchPRSection({
  repoInfo,
  setRepoInfo,
  setPRs,
  setSelectedPR,
  setIsLoadingPRs,
  isLoadingPRs,
  setError
}: FetchPRSectionProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [showQuickRepos, setShowQuickRepos] = useState(true);
  const { toast } = useToast();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentRepoSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches from localStorage", e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (search: string) => {
    const updatedSearches = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentRepoSearches', JSON.stringify(updatedSearches));
  };

  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
  };

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    // Handle direct owner/repo format
    if (/^[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+$/.test(url)) {
      const [owner, repo] = url.split("/");
      return { owner, repo };
    }

    // Handle full GitHub URL format
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "github.com") {
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          return { owner: pathParts[0], repo: pathParts[1] };
        }
      }
    } catch (error) {
      // Not a valid URL, continue to error case
    }

    return null;
  };

  const handleFetchPRs = async (inputUrl = repoUrl) => {
    const parsedRepo = parseRepoUrl(inputUrl);
    
    if (!parsedRepo) {
      toast({
        title: "Invalid Repository Format",
        description: "Please enter a valid GitHub repository URL or owner/repo format",
        variant: "destructive",
      });
      return;
    }
    
    // Hide quick repos section when a search starts
    setShowQuickRepos(false);
    
    // Save to recent searches
    saveRecentSearch(inputUrl);

    setIsLoadingPRs(true);
    setSelectedPR(null);
    setError(null);

    try {
      const prs = await fetchPRs(parsedRepo.owner, parsedRepo.repo);
      setPRs(prs);
      setRepoInfo(parsedRepo);
      
      if (prs.length === 0) {
        toast({
          title: "No Pull Requests Found",
          description: "The repository exists but has no merged pull requests.",
        });
      } else {
        toast({
          title: "Pull Requests Loaded",
          description: `Found ${prs.length} merged PRs from ${parsedRepo.owner}/${parsedRepo.repo}`,
        });
      }
    } catch (error) {
      console.error("Error fetching PRs:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Error Fetching PRs",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setPRs([]);
    } finally {
      setIsLoadingPRs(false);
    }
  };

  const handleQuickRepoSelect = (repoPath: string) => {
    setRepoUrl(repoPath);
    handleFetchPRs(repoPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetchPRs();
    }
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-6 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full rotate-3"></div>
            <div className="relative flex items-center justify-center text-black h-7 w-7 rounded-full font-semibold text-sm mr-3 z-10">1</div>
          </div>
          <h2 className="text-xl font-semibold gradient-text">Fetch Pull Requests</h2>
        </motion.div>

        <motion.div 
          className="accent-card accent-purple rounded-xl shadow-sm overflow-hidden mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="p-6 relative">
            {/* Subtle animated background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-20 top-4 w-40 h-40 bg-highlight-purple/5 rounded-full blur-2xl animate-pulse-slow"></div>
              <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-highlight-blue/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
            </div>
            
            <div className="relative z-10 mb-4">
              <label htmlFor="repo-url" className="block text-sm font-medium mb-2 flex items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-highlight-purple/20 mr-2">
                  <Github className="h-3 w-3 text-highlight-purple" />
                </div>
                GitHub Repository URL
              </label>
              <div className="relative">
                <Input
                  id="repo-url"
                  type="text"
                  placeholder="https://github.com/owner/repo or owner/repo"
                  value={repoUrl}
                  onChange={handleRepoUrlChange}
                  onKeyDown={handleKeyDown}
                  className="pr-12 h-10 pl-10 modern-input focus-within:border-highlight-purple focus-within:ring-highlight-purple/30"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                {repoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setRepoUrl("")}
                  >
                    ×
                  </Button>
                )}
              </div>
              <div className="mt-1.5 flex items-center text-sm text-muted-foreground">
                <GitMerge className="h-3 w-3 mr-1.5" />
                Paste a GitHub repository URL or enter in the format "owner/repo"
              </div>
            </div>

            {/* Quick access repos */}
            <AnimatePresence>
              {showQuickRepos && (
                <motion.div 
                  className="my-6 p-3 bg-muted/30 rounded-lg border border-border/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-3 text-sm font-medium flex items-center">
                    <span className="bg-highlight-purple/20 text-highlight-purple text-xs px-1.5 py-0.5 rounded mr-2">
                      Popular
                    </span>
                    Try one of these repositories:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_REPOS.map((repo) => (
                      <Button
                        key={repo.url}
                        variant="outline"
                        size="sm"
                        className="text-xs github-btn border-border/70 hover:border-highlight-purple/50"
                        onClick={() => handleQuickRepoSelect(repo.url)}
                      >
                        <Github className="h-3 w-3 mr-1.5 text-highlight-purple/80" />
                        {repo.name}
                      </Button>
                    ))}
                  </div>
                  
                  {recentSearches.length > 0 && (
                    <>
                      <div className="my-3 text-sm font-medium flex items-center">
                        <span className="bg-highlight-blue/20 text-highlight-blue text-xs px-1.5 py-0.5 rounded mr-2">
                          Recent
                        </span>
                        Your previous searches:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search) => (
                          <Button
                            key={search}
                            variant="ghost"
                            size="sm"
                            className="text-xs border border-border/50 bg-background/50 hover:bg-background/80"
                            onClick={() => handleQuickRepoSelect(search)}
                          >
                            <GitMerge className="h-3 w-3 mr-1.5 text-highlight-blue/80" />
                            {search}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                className="bg-primary text-black font-medium hover:bg-primary/90 transition-all duration-200"
                onClick={() => handleFetchPRs()}
                disabled={isLoadingPRs}
              >
                {isLoadingPRs ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GitMerge className="mr-2 h-4 w-4" />
                )}
                {isLoadingPRs ? "Loading..." : "Fetch Pull Requests"}
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {repoInfo && (
            <motion.div 
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <Github className="h-4 w-4 text-blue-500 mr-2" />
                <div className="text-sm">
                  Currently viewing: <span className="font-medium text-blue-700 dark:text-blue-300">{repoInfo.owner}/{repoInfo.repo}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-xs h-7"
                  onClick={() => {
                    setRepoInfo(null);
                    setPRs([]);
                    setShowQuickRepos(true);
                  }}
                >
                  Change
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
