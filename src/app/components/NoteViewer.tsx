"use client";

import { motion } from "framer-motion";
import StreamingTypewriter from "./StreamingTypewriter";
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
    <section className="mt-16 space-y-10 animate-fade-in">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-extrabold text-gradient neon-text mb-2 tracking-tight">
          Generated Release Notes
        </h2>
        <p className="text-sm text-muted-foreground">
          For PR <span className="font-mono text-yellow-400">#{prNumber}</span> —{" "}
          <span className="italic">{prTitle}</span>
        </p>
      </motion.div>

      {/* Developer Notes */}
      <motion.div
        className="glass-card relative border-l-4 border-yellow-400 dark:border-yellow-300 p-6 shadow-lg transition-all"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute top-4 right-4 text-yellow-400">
          <BrainCircuit className="w-7 h-7 animate-pulse-slow drop-shadow" />
        </div>
        <h3 className="text-xl font-bold text-gradient mb-3">🧠 Developer Notes</h3>
        <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
          {isGenerating ? (
            <StreamingTypewriter fullText={developerNotes} speed={12} />
          ) : (
            developerNotes
          )}
        </div>
      </motion.div>

      {/* Marketing Notes */}
      <motion.div
        className="glass-card relative border-l-4 border-yellow-400 dark:border-yellow-300 p-6 shadow-lg transition-all"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute top-4 right-4 text-yellow-400">
          <Sparkles className="w-7 h-7 animate-pulse drop-shadow" />
        </div>
        <h3 className="text-xl font-bold text-gradient mb-3">📢 Marketing Notes</h3>
        <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
          {isGenerating ? (
            <StreamingTypewriter fullText={marketingNotes} speed={12} />
          ) : (
            marketingNotes
          )}
        </div>
      </motion.div>

      {/* Timestamp */}
      <motion.div
        className="text-right text-xs text-muted-foreground italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Generated on {new Date(generatedAt).toLocaleString()}
      </motion.div>
    </section>
  );
}
