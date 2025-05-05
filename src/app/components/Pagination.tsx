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
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-wrap justify-between items-center gap-4 mt-8", 
        className
      )}
    >
      {/* Page info with enhanced styling */}
      <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:flex items-center">
        {totalPages > 0 ? (
          <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            No pages available
          </span>
        )}
      </div>
      
      {/* Pagination controls with improved styling */}
      <div className="flex items-center gap-2 mx-auto md:mx-0 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className={cn(
            "h-8 px-3 text-xs font-medium rounded-md border-gray-200 dark:border-gray-700",
            "transition-all duration-200",
            currentPage === 1 || isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers with improved visual feedback */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div 
                  key={`ellipsis-${index}`} 
                  className="flex items-center justify-center h-8 w-8 text-gray-400 dark:text-gray-500"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }
            
            const isActive = currentPage === page;
            
            return (
              <motion.div key={index} className="relative">
                <Button
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={isLoading || isActive}
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs font-medium rounded-md relative z-10",
                    isActive 
                      ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500" 
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800"
                  )}
                >
                  {page}
                </Button>
                
                {/* Active page indicator animation */}
                {isActive && (
                  <motion.div
                    layoutId="activePage"
                    className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-md"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ zIndex: 5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className={cn(
            "h-8 px-3 text-xs font-medium rounded-md border-gray-200 dark:border-gray-700",
            "transition-all duration-200",
            currentPage === totalPages || isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
      
      {/* Fetch more button with improved styling */}
      {hasMorePages && onFetchMore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onFetchMore}
            disabled={isLoading}
            className="ml-auto mt-4 md:mt-0 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm h-9 px-4 rounded-lg"
          >
            {isLoading ? (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <svg className="animate-spin mr-2 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading more...</span>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
                <span>Fetch More Pull Requests</span>
              </motion.div>
            )}
          </Button>
        </motion.div>
      )}
    </motion.nav>
  );
}