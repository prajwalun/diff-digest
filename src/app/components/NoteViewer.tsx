"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  ExternalLink,
  Code,
  Megaphone,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface NoteData {
  prNumber: number;
  prTitle: string;
  generatedAt: string;
  developerNotes: string;
  marketingNotes: string;
  prId: number; // ✅ Updated from string to number to match your actual type
}

interface NoteViewerProps {
  notes: NoteData | null;
  isGenerating: boolean;
}

export function NoteViewer({ notes, isGenerating }: NoteViewerProps) {
  const handleDownload = () => {
    if (!notes) return;

    const content = `# Developer Notes\n\n${notes.developerNotes}\n\n# Marketing Notes\n\n${notes.marketingNotes}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = href;
    a.download = `release-notes-pr-${notes.prNumber}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10"
    >
      <div className="glass-card rounded-xl border">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {notes && (
                <Badge variant="outline" className="text-xs bg-primary/10">
                  PR #{notes.prNumber}
                </Badge>
              )}
              <span className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {notes ? new Date(notes.generatedAt).toLocaleDateString() : "-"}
              </span>
            </div>
            <h2 className="text-lg font-bold">{notes?.prTitle || "Generated Notes"}</h2>
          </div>

          {notes && (
            <div className="flex gap-2">
              <a
                href={`https://github.com/your-org/repo/pull/${notes.prNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm border border-primary/20 text-primary hover:text-primary/90 hover:bg-primary/5 px-3 py-1.5 rounded-md"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </a>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>

        <div className="p-6">
          {isGenerating ? (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mb-4"
              />
              <p className="text-lg font-medium text-gradient mb-2">
                Processing your request
              </p>
              <p className="text-sm text-gray-500">
                Generating detailed technical and marketing notes...
              </p>
            </div>
          ) : notes ? (
            <Tabs defaultValue="dev-notes">
              <TabsList className="mb-4">
                <TabsTrigger value="dev-notes">
                  <Code className="w-4 h-4 mr-2" />
                  Developer
                </TabsTrigger>
                <TabsTrigger value="marketing-notes">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Marketing
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dev-notes">
                <div className="prose dark:prose-invert">
                  <pre>{notes.developerNotes}</pre>
                </div>
              </TabsContent>
              <TabsContent value="marketing-notes">
                <div className="prose dark:prose-invert">
                  <pre>{notes.marketingNotes}</pre>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-sm text-gray-500">
              Select a PR and generate notes to see them here.
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
