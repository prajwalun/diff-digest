"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { AppHeader } from "./components/AppHeader";
import { EmptyState } from "./components/EmptyState";
import { HeroBanner } from "./components/HeroBanner";
import { PRList } from "./components/PRList";
import { GeneratedNotes } from "./components/GeneratedNotes";
import { FetchPRsSection } from "./components/FetchPRsSection";
import { PullRequest, GeneratedNotes as NotesType } from "../lib/types";

export default function HomePage() {
  // Manage application state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [repository, setRepository] = useState('openai/openai-node');
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [notes, setNotes] = useState<NotesType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPrId, setGeneratingPrId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  
  // Reference to the notes section for scrolling
  const notesRef = useRef<HTMLDivElement>(null);

  // Fetch PRs from the API
  const fetchPullRequests = async (owner?: string, repo?: string) => {
    try {
      setIsLoading(true);
      
      // If owner and repo are provided, update the repository state
      const repoPath = owner && repo ? `${owner}/${repo}` : repository;
      setRepository(repoPath);
      
      // Call the API to fetch PRs
      const response = await fetch(`/api/sample-diffs?repo=${repoPath}&page=1`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch pull requests');
      }
      
      const data = await response.json();
      
      // Update state with the fetched PRs
      setPullRequests(data.diffs || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setHasMorePages(data.nextPage !== null);
      
      // Show success toast
      toast.success('Pull Requests Loaded', {
        description: `Found ${data.diffs.length} pull requests from ${repoPath}`
      });
    } catch (error) {
      console.error('Error fetching PRs:', error);
      
      // Show error toast
      toast.error('Failed to Fetch Pull Requests', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch more PRs (pagination)
  const fetchMorePullRequests = async () => {
    if (loadingMore || !hasMorePages) return;
    
    try {
      setLoadingMore(true);
      
      // Call API with the next page
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/sample-diffs?repo=${repository}&page=${nextPage}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch more pull requests');
      }
      
      const data = await response.json();
      
      // Append new PRs to the existing list
      setPullRequests(prev => [...prev, ...(data.diffs || [])]);
      setCurrentPage(data.currentPage || nextPage);
      setTotalPages(data.totalPages || totalPages);
      setHasMorePages(data.nextPage !== null);
      
      // Show success toast
      toast.success('More Pull Requests Loaded', {
        description: `Loaded page ${nextPage} of pull requests`
      });
    } catch (error) {
      console.error('Error fetching more PRs:', error);
      
      // Show error toast
      toast.error('Failed to Fetch More Pull Requests', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // Filter the PRs for the selected page
    // This is client-side pagination based on the already loaded PRs
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate notes for a selected PR
  const generateNotes = async (pr: PullRequest) => {
    try {
      setIsGenerating(true);
      setGeneratingPrId(pr.id);
      
      // Reset existing notes
      setNotes(null);
      
      // Call the API to generate notes
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prId: pr.id, 
          prNumber: pr.number,
          prTitle: pr.title,
          diff: pr.diff || ''
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate notes');
      }
      
      // Handle streaming response
      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        // For this extracted version, we'll simulate the streaming response
        // with a timeout to simulate processing
        
        setTimeout(() => {
          // Create mock notes
          const mockNotes: NotesType = {
            prId: pr.id,
            prNumber: pr.number,
            prTitle: pr.title,
            developerNotes: `# Developer Notes for PR #${pr.number}: ${pr.title}\n\n## Changes Overview\n- Added new features\n- Fixed several bugs\n- Improved performance\n\n## Technical Details\nThe changes include modifications to core functionality with careful consideration for backwards compatibility.`,
            marketingNotes: `# Marketing Notes for PR #${pr.number}: ${pr.title}\n\n## Key Benefits\n- Enhanced user experience\n- Improved reliability\n- Added new capabilities\n\n## Value Proposition\nThese changes provide significant value to users by addressing their needs more effectively.`,
            generatedAt: new Date().toISOString()
          };
          
          // Update state with generated notes
          setNotes(mockNotes);
          
          // Scroll to the notes section
          if (notesRef.current) {
            notesRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          
          // Show success toast
          toast.success('Notes Generated Successfully', {
            description: `Generated notes for PR #${pr.number}`
          });
        }, 2500); // Simulate processing time
        
        return;
      }
      
      // If not streaming, handle regular JSON response
      const data = await response.json();
      
      // Update state with generated notes
      setNotes({
        prId: pr.id,
        prNumber: pr.number,
        prTitle: pr.title,
        developerNotes: data.developerNotes || '',
        marketingNotes: data.marketingNotes || '',
        generatedAt: new Date().toISOString()
      });
      
      // Scroll to the notes section
      if (notesRef.current) {
        notesRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Show success toast
      toast.success('Notes Generated Successfully', {
        description: `Generated notes for PR #${pr.number}`
      });
    } catch (error) {
      console.error('Error generating notes:', error);
      
      // Show error toast
      toast.error('Failed to Generate Notes', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsGenerating(false);
      setGeneratingPrId(null);
    }
  };

  // Determine which view to show based on state
  const showEmptyState = pullRequests.length === 0 && !isLoading;
  const showPRList = pullRequests.length > 0 || isLoading;

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <AppHeader isLoading={isLoading} />
      
      {/* Main content */}
      <div className="flex-1">
        {/* Hero banner - shown only when no PRs are loaded */}
        {showEmptyState && <HeroBanner onFetch={fetchPullRequests} isLoading={isLoading} />}
        
        {/* Fetch PRs section */}
        <FetchPRsSection 
          onFetch={fetchPullRequests} 
          isLoading={isLoading} 
          repoName={repository}
          hasPRs={showPRList}
        />
        
        {/* Main content area */}
        <div className="container mx-auto px-4 py-4">
          {/* Empty state */}
          {showEmptyState && <EmptyState onFetch={fetchPullRequests} isLoading={isLoading} />}
          
          {/* PR List */}
          {showPRList && (
            <PRList 
              prs={pullRequests}
              onGenerateNotes={generateNotes}
              isGenerating={isGenerating}
              generatingPrId={generatingPrId}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasMorePages={hasMorePages}
              onFetchMore={fetchMorePullRequests}
              isLoadingMore={loadingMore}
            />
          )}
          
          {/* Generated Notes */}
          <GeneratedNotes 
            ref={notesRef}
            notes={notes} 
            isGenerating={isGenerating} 
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Diff Digest. Built with Next.js, OpenAI and GitHub API.</p>
          <p className="mt-2">
            <a href="https://github.com/prajwalun/diff-digest" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}