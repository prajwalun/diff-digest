// components/Pagination.tsx
"use client";
import { cn } from "../../lib/utils";
import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  hasMorePages?: boolean;
  onFetchMore?: () => void;
  isLoading?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className,
  hasMorePages = false,
  onFetchMore,
  isLoading = false
}: PaginationProps) {

  // Generate page numbers with ellipsis for large page counts
  const pageNumbers = React.useMemo(() => {
    const numbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      // Always show first page
      numbers.push(1);
      
      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        numbers.push("ellipsis-start");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        numbers.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        numbers.push("ellipsis-end");
      }
      
      // Always show last page
      if (totalPages > 1) {
        numbers.push(totalPages);
      }
    }
    
    return numbers;
  }, [totalPages, currentPage]);
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1 && !hasMorePages) {
    return null;
  }
  
  return (
    <nav className={cn("flex flex-wrap justify-between items-center mt-8", className)}>
      {/* Page info */}
      <div className="text-xs text-muted-foreground hidden md:block">
        {totalPages > 0 ? (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        ) : (
          <span>No pages available</span>
        )}
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 mx-auto md:mx-0">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="h-8 px-2 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div 
                  key={`ellipsis-${index}`} 
                  className="flex items-center justify-center h-8 w-8 text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }
            
            const isActive = currentPage === page;
            
            return (
              <Button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={isLoading || isActive}
                variant={isActive ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-xs"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="h-8 px-2 text-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
      
      {/* Fetch more button */}
      {hasMorePages && onFetchMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFetchMore}
          disabled={isLoading}
          className="ml-auto mt-4 md:mt-0 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>Fetch More PRs</>
          )}
        </Button>
      )}
    </nav>
  );
}