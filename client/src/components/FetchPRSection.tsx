import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPRs, PaginationResult } from "@/lib/github";
import { RefreshCw, Github, GitMerge } from "lucide-react";
import { PR } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface FetchPRSectionProps {
  repoInfo: { owner: string; repo: string } | null;
  setRepoInfo: (info: { owner: string; repo: string } | null) => void;
  setPRs: (prs: PR[]) => void;
  setSelectedPR: (pr: PR | null) => void;
  setIsLoadingPRs: (loading: boolean) => void;
  isLoadingPRs: boolean;
  setError: (error: string | null) => void;
  setPagination: (pagination: PaginationResult | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

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
  setError,
  setPagination,
  currentPage,
  setCurrentPage
}: FetchPRSectionProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [showQuickRepos, setShowQuickRepos] = useState(true);
  const { toast } = useToast();

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    if (/^[\w-]+\/[\w.-]+$/.test(url)) {
      const [owner, repo] = url.split("/");
      return { owner, repo };
    }
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parsed.hostname === "github.com" && parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    } catch (_) {}
    return null;
  };

  const fetchPagedPRs = async (owner: string, repo: string, page: number = 1) => {
    setIsLoadingPRs(true);
    setError(null);

    try {
      console.log(`Fetching PRs for ${owner}/${repo}, page ${page}`);
      
      const result = await fetchPRs(owner, repo, page);
      
      // Validate response shape
      console.log("PR fetch result:", {
        prsCount: result.pullRequests?.length || 0,
        hasPagination: !!result.pagination,
        paginationDetails: result.pagination
      });
      
      // Set pull requests data
      setPRs(Array.isArray(result.pullRequests) ? result.pullRequests : []);
      
      // Safely set pagination data
      if (result.pagination && typeof result.pagination === 'object') {
        setPagination(result.pagination);
        
        // Ensure page is a number
        if (typeof result.pagination.page === 'number') {
          setCurrentPage(result.pagination.page);
        } else {
          // Fallback to the page we requested if API doesn't return it correctly
          setCurrentPage(page);
          
          // Fix the pagination object
          const fixedPagination = {
            ...result.pagination,
            page: page
          };
          setPagination(fixedPagination);
        }
      } else {
        // Create a default pagination object if none exists
        const defaultPagination = {
          page: page,
          per_page: 10,
          has_next_page: false,
          has_prev_page: page > 1,
          total_count: null
        };
        setPagination(defaultPagination);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error fetching PRs:", error);
      setError(error.message || "Unknown error");
      setPRs([]);
      setPagination(null);
      toast({
        title: "Error Fetching PRs",
        description: error.message || "Unknown error",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoadingPRs(false);
    }
  };

  const handleFetchPRs = async (inputUrl = repoUrl) => {
    const parsedRepo = parseRepoUrl(inputUrl);
    if (!parsedRepo) {
      toast({
        title: "Invalid Repository Format",
        description: "Enter in the form 'owner/repo' or full GitHub URL",
        variant: "destructive"
      });
      return;
    }

    setShowQuickRepos(false);
    setSelectedPR(null);
    setCurrentPage(1); // Reset to first page when fetching a new repo

    try {
      const result = await fetchPagedPRs(parsedRepo.owner, parsedRepo.repo, 1);
      setRepoInfo(parsedRepo);

      // Show success message with pagination info
      const prCount = result.pullRequests.length;
      const totalEstimate = result.pagination.total_count;
      
      toast({
        title: prCount ? "Pull Requests Loaded" : "No Pull Requests Found",
        description: prCount
          ? `Found ${prCount} PRs on page 1${totalEstimate ? ` (approximately ${totalEstimate} total)` : ''} from ${parsedRepo.owner}/${parsedRepo.repo}`
          : "The repository exists but has no merged pull requests.",
        variant: prCount ? "default" : "warning"
      });
    } catch (error: any) {
      // Error already handled in fetchPagedPRs
    }
  };

  const handleQuickRepoSelect = (repoPath: string) => {
    setRepoUrl(repoPath);
    handleFetchPRs(repoPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFetchPRs();
  };
  
  // Function to handle page changes - to be passed to the PRList component
  const handlePageChange = async (page: number) => {
    if (!repoInfo) return;
    
    // Fetch the new page of PRs
    try {
      await fetchPagedPRs(repoInfo.owner, repoInfo.repo, page);
      
      // Reset selected PR when changing pages
      setSelectedPR(null);
      
      // Scroll back to the top of the PR list for better UX
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      // Error handling already in fetchPagedPRs
      console.error("Failed to change page:", error);
    }
  };
  
  // Watch for currentPage changes from parent component
  React.useEffect(() => {
    // Only fetch when both repoInfo exists and currentPage changes to a valid value
    if (repoInfo && currentPage > 0) {
      // Create a cleanup variable to prevent state updates after unmount
      let isActive = true;
      
      const fetchPage = async () => {
        try {
          if (isActive) {
            await fetchPagedPRs(repoInfo.owner, repoInfo.repo, currentPage);
          }
        } catch (err) {
          console.error("Error in page fetch effect:", err);
        }
      };
      
      fetchPage();
      
      // Cleanup function
      return () => {
        isActive = false;
      };
    }
  }, [currentPage, repoInfo?.owner, repoInfo?.repo]); // More specific dependencies

  return (
    <section id="fetch-pr-section" className="py-8 px-4">
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
          className="rounded-xl shadow-sm overflow-hidden mb-8 accent-card accent-purple" 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="p-6">
            <label htmlFor="repo-url" className="block text-sm font-medium mb-2 flex items-center">
              <Github className="h-4 w-4 mr-2" /> GitHub Repository
            </label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="owner/repo or GitHub URL"
              className="pr-10 pl-10"
            />
            {repoUrl && (
              <Button 
                className="mt-2" 
                variant="ghost" 
                size="sm" 
                onClick={() => setRepoUrl("")}
              >
                Clear
              </Button>
            )}

            {showQuickRepos && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Try popular repositories:</div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_REPOS.map(repo => (
                    <Button 
                      key={repo.url} 
                      onClick={() => handleQuickRepoSelect(repo.url)} 
                      size="sm" 
                      variant="outline"
                    >
                      {repo.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-right">
              <Button 
                onClick={() => handleFetchPRs()} 
                disabled={isLoadingPRs}
              >
                {isLoadingPRs ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <GitMerge className="h-4 w-4 mr-2" />
                )} 
                Fetch PRs
              </Button>
            </div>
          </div>
        </motion.div>

        {repoInfo && (
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Currently viewing: <strong>{repoInfo.owner}/{repoInfo.repo}</strong>
              </span>
              <Button 
                size="sm" 
                variant="outline" 
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
      </div>
    </section>
  );
}