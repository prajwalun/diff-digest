import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, GitPullRequest, GitMerge, Calendar, 
  User, FileText, Search, Github, ChevronLeft, ChevronRight 
} from "lucide-react";
import { PR } from "@/lib/types";
import { PaginationResult } from "@/lib/github";
import { formatDistance, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PRListProps {
  prs: PR[];
  selectedPR: PR | null;
  setSelectedPR: (pr: PR | null) => void;
  isLoading: boolean;
  pagination?: PaginationResult;
  onPageChange?: (page: number) => void;
  currentRepo?: { owner: string; repo: string } | null;
}

export default function PRList({ 
  prs, 
  selectedPR, 
  setSelectedPR, 
  isLoading,
  pagination,
  onPageChange,
  currentRepo
}: PRListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPR, setExpandedPR] = useState<number | null>(null);
  
  if (prs.length === 0 && !isLoading) return null;

  const handleSelectPR = (pr: PR) => {
    setSelectedPR(pr);
    // Auto-scroll to the notes section
    setTimeout(() => {
      document.getElementById('generate-notes-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };
  
  const toggleExpandPR = (prNumber: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedPR(expandedPR === prNumber ? null : prNumber);
  };
  
  const handlePrevPage = () => {
    if (pagination && pagination.page > 1 && onPageChange) {
      onPageChange(pagination.page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pagination && pagination.has_next_page && onPageChange) {
      onPageChange(pagination.page + 1);
    }
  };
  
  // Filter PRs based on search query
  const filteredPRs = searchQuery.trim() === '' 
    ? prs 
    : prs.filter(pr => 
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pr.body && pr.body.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pr.number.toString().includes(searchQuery) ||
        (pr.user?.login && pr.user.login.toLowerCase().includes(searchQuery.toLowerCase()))
      );

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
            <div className="relative flex items-center justify-center text-black h-7 w-7 rounded-full font-semibold text-sm mr-3 z-10">2</div>
          </div>
          <h2 className="text-xl font-semibold gradient-text">Select a Pull Request</h2>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="accent-card accent-blue rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-6 relative">
              {/* Subtle animated background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -right-20 top-10 w-40 h-40 bg-highlight-blue/5 rounded-full blur-2xl animate-pulse-slow"></div>
                <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-highlight-green/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
              </div>
            
              {prs.length > 0 && !isLoading && (
                <div className="mb-6 relative z-10">
                  <div className="relative">
                    <Input
                      placeholder="Search pull requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 modern-input focus-within:border-highlight-blue focus-within:ring-highlight-blue/30"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-blue/20 mr-2">
                      <GitPullRequest className="h-3 w-3 text-highlight-blue" />
                    </div>
                    Found {filteredPRs.length} pull requests
                  </div>
                </div>
              )}
              
              {isLoading ? (
                // Loading state with animated skeletons
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                // PR List with animations
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredPRs.map((pr) => (
                      <motion.div
                        key={pr.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg overflow-hidden hover-card transition-all duration-200 ${
                          selectedPR?.number === pr.number 
                            ? 'border-2 border-highlight-yellow bg-warning-bg dark:bg-warning-bg/20 shadow-md' 
                            : 'border border-border glass-card'
                        }`}
                        onClick={() => handleSelectPR(pr)}
                      >
                        <div className="p-4 relative">
                          {/* Selected indicator */}
                          {selectedPR?.number === pr.number && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-yellow"></div>
                          )}
                          
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5 flex-shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-highlight-purple/10">
                                  <GitMerge className="h-4 w-4 text-highlight-purple" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                  <h3 className="font-medium">{pr.title}</h3>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-highlight-purple/10 text-highlight-purple">
                                    #{pr.number}
                                  </span>
                                </div>
                                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                                  {pr.body || "No description provided."}
                                </p>
                                
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-green/10 mr-1.5">
                                      <Calendar className="h-3 w-3 text-highlight-green" />
                                    </div>
                                    <span>Merged {pr.merged_at ? formatDistance(new Date(pr.merged_at), new Date(), { addSuffix: true }) : 'Unknown'}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-blue/10 mr-1.5">
                                      <User className="h-3 w-3 text-highlight-blue" />
                                    </div>
                                    <span className="font-medium">{pr.user?.login || "unknown"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              onClick={(e) => toggleExpandPR(pr.number, e)}
                              className="ml-2 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                              aria-label={expandedPR === pr.number ? "Collapse details" : "Expand details"}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Expandable details section */}
                        <AnimatePresence>
                          {expandedPR === pr.number && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-muted/30 border-t border-border/50 px-5 py-4"
                            >
                              <div className="text-sm space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs mb-1">Created</span>
                                    <div className="font-medium flex items-center">
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-blue/10 mr-1.5">
                                        <Calendar className="h-3 w-3 text-highlight-blue" />
                                      </div>
                                      {format(new Date(pr.created_at), 'MMM d, yyyy')}
                                    </div>
                                  </div>
                                  
                                  {pr.merged_at && (
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs mb-1">Merged</span>
                                      <div className="font-medium flex items-center">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-purple/10 mr-1.5">
                                          <GitMerge className="h-3 w-3 text-highlight-purple" />
                                        </div>
                                        {format(new Date(pr.merged_at), 'MMM d, yyyy')}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs mb-1">Repository</span>
                                    <div className="font-medium flex items-center truncate">
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-highlight-green/10 mr-1.5">
                                        <Github className="h-3 w-3 text-highlight-green" />
                                      </div>
                                      <span className="truncate">{pr.base.repo.full_name}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs mb-1">Actions</span>
                                    <div>
                                      <a 
                                        href={pr.html_url || pr._links?.html?.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded-md bg-highlight-blue/10 text-highlight-blue text-xs font-medium hover:bg-highlight-blue/20 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <GitPullRequest className="h-3 w-3 mr-1.5" />
                                        View on GitHub
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredPRs.length === 0 && searchQuery && (
                    <div className="text-center py-10">
                      <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No pull requests match your search.</p>
                      <button 
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {pagination && pagination.page && !searchQuery && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {currentRepo && (
                          <span>
                            Showing page {pagination.page} 
                            {pagination.total_count ? 
                              ` of approximately ${Math.ceil(pagination.total_count / pagination.per_page)} pages` : 
                              ''}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={!pagination.has_prev_page || pagination.page <= 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!pagination.has_next_page}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
