"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EmptyStateProps {
  onFetch: () => void;
}

export function EmptyState({ onFetch }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-center py-20"
    >
      <Card className="glass-card max-w-lg w-full p-10 md:p-16 text-center relative overflow-hidden border-dashed border-2 border-border shadow-lg hover:shadow-2xl transition">
        <motion.div
          className="flex justify-center mb-8"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <div className="p-6 bg-gradient-to-br from-primary to-secondary rounded-full shadow-md">
            <FileText className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-extrabold text-gradient mb-4">
          No Pull Requests Found
        </h2>
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          Let’s fetch the latest pull requests and generate amazing release notes!
        </p>

        <Button
          onClick={onFetch}
          size="lg"
          className="button-primary px-8 py-5 text-base group relative overflow-hidden"
        >
          <span className="relative z-10">Fetch Pull Requests</span>
          <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Powered by AI ✨
        </p>
      </Card>
    </motion.div>
  );
}
