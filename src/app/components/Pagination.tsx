"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const DOTS = "..."
  
  const generateRange = (start: number, end: number) => {
    const length = end - start + 1
    return Array.from({ length }, (_, i) => start + i)
  }

  const getPaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5
    if (totalPageNumbers >= totalPages) return generateRange(1, totalPages)

    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    if (!showLeftDots && showRightDots) {
      const leftRange = generateRange(1, 3 + 2 * siblingCount)
      return [...leftRange, DOTS, totalPages]
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = generateRange(totalPages - (2 + 2 * siblingCount), totalPages)
      return [firstPageIndex, DOTS, ...rightRange]
    }

    if (showLeftDots && showRightDots) {
      const middleRange = generateRange(leftSibling, rightSibling)
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
    }
  }

  const paginationRange = getPaginationRange()

  if (!paginationRange || paginationRange.length < 2) return null

  return (
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-10 flex justify-center items-center gap-2"
    >
      <button
        className="px-3 py-2 rounded-md text-sm bg-accent text-accent-foreground hover:bg-accent/60 transition disabled:opacity-30"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {paginationRange.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === DOTS}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition",
            page === currentPage
              ? "bg-primary text-white"
              : "bg-background text-muted-foreground hover:bg-accent/30",
            page === DOTS && "cursor-default opacity-60"
          )}
        >
          {page}
        </button>
      ))}

      <button
        className="px-3 py-2 rounded-md text-sm bg-accent text-accent-foreground hover:bg-accent/60 transition disabled:opacity-30"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.nav>
  )
}
