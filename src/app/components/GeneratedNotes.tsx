// components/GeneratedNotes.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Clipboard,
  Check,
  FileCode,
  Terminal,
  MessageSquare,
  AlertCircle,
  LucideProps,
} from "lucide-react";
import { Button } from "./ui/button";
import { GeneratedNotes as NotesType } from "@/lib/types";
import { toast } from "sonner";

const DevIcon = (props: LucideProps) => <Terminal {...props} />;
const MarketingIcon = (props: LucideProps) => <MessageSquare {...props} />;

export function GeneratedNotes({
  notes,
  isGenerating,
}: {
  notes: NotesType | null;
  isGenerating: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState<"dev" | "marketing">("dev");
  const [copied, setCopied] = React.useState(false);

  const handleDownload = () => {
    if (!notes) {
      toast.warning("No notes to download");
      return;
    }

    const content = `# Developer Notes\n\n${notes.developerNotes}\n\n# Marketing Notes\n\n${notes.marketingNotes}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `release-notes-pr-${notes.prNumber || "generated"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Downloaded as Markdown");
  };

  const handleCopy = async () => {
    if (!notes) {
      toast.warning("No notes to copy");
      return;
    }

    try {
      const content =
        activeTab === "dev" ? notes.developerNotes : notes.marketingNotes;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Generating notes...
          </p>
        </div>
      );
    }

    if (!notes) {
      return (
        <div className="py-16 text-center">
          <FileCode className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Select a PR and click "Generate Notes"
          </p>
        </div>
      );
    }

    const noteContent =
      activeTab === "dev" ? notes.developerNotes : notes.marketingNotes;

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="prose prose-sm dark:prose-invert max-w-none h-[400px] overflow-auto p-5 scrollable"
        dangerouslySetInnerHTML={{ __html: noteContent }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 border border-border rounded-lg shadow-sm bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center">
          <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-2">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-card-foreground">
              {notes?.prTitle || "Generated Notes"}
            </h2>
            {notes?.prNumber && (
              <p className="text-xs text-muted-foreground">
                PR #{notes.prNumber}
              </p>
            )}
          </div>
        </div>
        {notes?.generatedAt && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {new Date(notes.generatedAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="border-b border-border">
        <div className="flex bg-secondary/50">
          <button
            onClick={() => setActiveTab("dev")}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150
              ${activeTab === "dev"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <DevIcon className="h-4 w-4 mr-1.5" />
            <span>Developer Notes</span>
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150
              ${activeTab === "marketing"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <MarketingIcon className="h-4 w-4 mr-1.5" />
            <span>Marketing Notes</span>
          </button>
        </div>
      </div>

      <div>
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>

      {notes && (
        <>
          <div className="flex justify-end gap-3 border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 w-3.5 mr-1.5" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={`transition-colors duration-150 ${
                copied 
                  ? 'border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 w-3.5 mr-1.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 w-3.5 mr-1.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="px-4 pb-4">
            <div className="mt-1 p-3 rounded-md border border-border bg-secondary/50 flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-xs text-muted-foreground">
                These notes are AI-generated and may require review before publishing.
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}