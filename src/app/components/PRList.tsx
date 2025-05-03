"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRItem } from "./PRItem";
import { Pagination } from "./Pagination";

interface PRListProps {
  prs: { id: string; description: string }[];
  onGenerate: (pr: any) => void;
  generatingId: string | null;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  error: string | null;
}

export function PRList({
  prs,
  onGenerate,
  generatingId,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  error,
}: PRListProps) {
  return (
    <motion.section
      className="flex flex-col space-y-6 my-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {error && (
        <div className="p-4 rounded-lg border border-red-500 bg-red-500/10 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <AnimatePresence>
        {prs.map((pr) => (
          <PRItem
            key={pr.id}
            pr={pr}
            onGenerate={onGenerate}
            isGenerating={isLoading}
            generatingId={generatingId}
          />
        ))}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </motion.section>
  );
}
