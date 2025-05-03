"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Download, Clipboard } from "lucide-react";

interface NoteViewerProps {
  notes: {
    prId: number;
    prTitle: string;
    developerNotes: string;
    marketingNotes: string;
    generatedAtts: any[];
  } | null;
  isGenerating: boolean;
}

export function NoteViewer({ notes, isGenerating }: NoteViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy text");
    }
  };

  const handleDownload = () => {
    if (!notes) return;
    const content = `# Developer Notes\n\n${notes.developerNotes}\n\n# Marketing Notes\n\n${notes.marketingNotes}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `release-notes-pr-${notes.prId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  };

  if (!notes) {
    return (
      <div className="text-center text-muted-foreground mt-16 text-lg">
        No notes available yet.
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <div className="rounded-2xl bg-black/70 backdrop-blur-lg p-8 border border-border shadow-lg space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1">Generated Notes</h3>
            <p className="text-sm text-muted-foreground">
              PR #{notes.prId} — {notes.prTitle}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={() => handleCopy(notes.developerNotes)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Dev"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-yellow-400 mb-2 font-semibold text-lg">
              🛠️ Developer Notes
            </h4>
            <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg min-h-[150px]">
              {isGenerating ? "Generating..." : notes.developerNotes || "No developer notes available."}
            </div>
          </div>

          <div>
            <h4 className="text-yellow-400 mb-2 font-semibold text-lg">
              🚀 Marketing Notes
            </h4>
            <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg min-h-[150px]">
              {isGenerating ? "Generating..." : notes.marketingNotes || "No marketing notes available."}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
