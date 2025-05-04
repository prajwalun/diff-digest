"use client";

import { motion } from "framer-motion";
import StreamingTypewriter from "./StreamingTypewriter";
import { Card } from "@/components/ui/card";
import { Sparkles, BrainCircuit } from "lucide-react";

interface NoteViewerProps {
  notes: {
    developerNotes: string;
    marketingNotes: string;
    prTitle: string;
    prNumber: number;
    generatedAt: string;
    prId: number;
  };
  isGenerating: boolean;
}

export function NoteViewer({ notes, isGenerating }: NoteViewerProps) {
  const { developerNotes, marketingNotes, prNumber, prTitle, generatedAt } = notes;

  return (
    <section className="mt-12 space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-gradient mb-2">Generated Release Notes</h2>
        <p className="text-sm text-muted-foreground">
          For PR #{prNumber}: <span className="italic">{prTitle}</span>
        </p>
      </motion.div>

      {/* Developer Notes */}
      <motion.div
        className="glass-card cyberpunk-border relative p-6"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute top-4 right-4 text-yellow-500">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-gradient mb-3">🧠 Developer Notes</h3>
        <div className="whitespace-pre-wrap text-sm text-foreground">
          {isGenerating ? (
            <StreamingTypewriter fullText={developerNotes} speed={12} />
          ) : (
            developerNotes
          )}
        </div>
      </motion.div>

      {/* Marketing Notes */}
      <motion.div
        className="glass-card cyberpunk-border relative p-6"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute top-4 right-4 text-yellow-500">
          <Sparkles className="w-6 h-6 animate-pulse-slow" />
        </div>
        <h3 className="text-xl font-semibold text-gradient mb-3">📢 Marketing Notes</h3>
        <div className="whitespace-pre-wrap text-sm text-foreground">
          {isGenerating ? (
            <StreamingTypewriter fullText={marketingNotes} speed={12} />
          ) : (
            marketingNotes
          )}
        </div>
      </motion.div>

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground text-right mt-4">
        Generated on {new Date(generatedAt).toLocaleString()}
      </p>
    </section>
  );
}
