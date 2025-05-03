"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { GitCommitIcon } from "lucide-react";

interface PRItemProps {
  pr: { id: string; description: string };
  onGenerate: (pr: any) => void;
  isGenerating: boolean;
  generatingId: string | null;
}

export function PRItem({ pr, onGenerate, isGenerating, generatingId }: PRItemProps) {
  const isActive = generatingId === pr.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-black/70 border border-border rounded-2xl p-6 hover:shadow-2xl backdrop-blur-md transition-all group"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <GitCommitIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-foreground text-base">
              PR #{pr.id}
            </div>
            <div className="text-muted-foreground line-clamp-2">
              {pr.description}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onGenerate(pr)}
          disabled={isGenerating}
          className="ml-0 md:ml-4"
        >
          {isActive ? "Generating..." : "Generate Notes"}
        </Button>
      </div>
    </motion.div>
  );
}
