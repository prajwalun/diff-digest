"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const visiblePages = 5;
    const half = Math.floor(visiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      const isActive = i === currentPage;
      pageNumbers.push(
        <Button
          key={i}
          variant={isActive ? "default" : "outline"}
          className={cn(
            "text-xs px-3 py-1 h-8 rounded-md border transition-all duration-150",
            isActive
              ? "bg-yellow-400 text-black font-semibold shadow-sm border-yellow-400 animate-pulse"
              : "bg-transparent hover:bg-accent hover:text-black border-border"
          )}
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div
      className={cn(
        "mt-12 flex justify-center items-center gap-2 flex-wrap animate-fade-in",
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={!canGoBack}
        className="h-8 w-8 p-0 border border-border hover:bg-accent hover:text-black disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={!canGoForward}
        className="h-8 w-8 p-0 border border-border hover:bg-accent hover:text-black disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
