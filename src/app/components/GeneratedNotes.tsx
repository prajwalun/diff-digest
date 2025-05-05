"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Copy, Check, Download, Code, RefreshCw, BookOpen, 
  Sparkles, MessageSquare, Share2, Zap, FileText,
  ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { copyToClipboard } from "../../lib/utils";

import { GeneratedNotes as GeneratedNotesType } from "../../lib/types";
import { normalizeNotes as adaptNotes, LegacyNotesType } from "../../lib/adapters";

interface GeneratedNotesProps {
  notes: LegacyNotesType | GeneratedNotesType | null;
  isGenerating: boolean;
}

export function GeneratedNotes({ notes, isGenerating }: GeneratedNotesProps) {
  const [activeTab, setActiveTab] = useState<string>("technical");
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  // Refs for the content to export
  const technicalNotesRef = useRef<HTMLDivElement>(null);
  const marketingNotesRef = useRef<HTMLDivElement>(null);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Normalize notes before use using the imported adapter function
  const normalizedNotes = adaptNotes(notes);

  // Function to handle copy button click
  const handleCopy = async (type: string) => {
    let textToCopy = "";
    
    if (type === "technical" && normalizedNotes?.technicalNotes) {
      textToCopy = normalizedNotes.technicalNotes;
    } else if (type === "marketing" && normalizedNotes?.marketingNotes) {
      textToCopy = normalizedNotes.marketingNotes;
    }
    
    if (textToCopy) {
      const success = await copyToClipboard(textToCopy);
      if (success) {
        setCopied(type);
        toast.success("Copied to clipboard");
      } else {
        toast.error("Failed to copy");
      }
    }
  };

  // Function to handle download
  const handleDownload = (type: string) => {
    let content = "";
    let filename = "";
    
    if (type === "technical" && normalizedNotes?.technicalNotes) {
      content = normalizedNotes.technicalNotes;
      filename = "technical-notes.md";
    } else if (type === "marketing" && normalizedNotes?.marketingNotes) {
      content = normalizedNotes.marketingNotes;
      filename = "marketing-notes.md";
    }
    
    if (content) {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${filename}`);
    }
  };

  // Show nothing if no notes and not generating
  if (!normalizedNotes && !isGenerating) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Release Notes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered documentation for developers and marketing
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {expanded && (
        <>
          {isGenerating ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-4 rounded-full bg-blue-400/10 dark:bg-blue-500/10 animate-pulse"></div>
                <div className="relative">
                  <div className="animate-spin text-blue-500 dark:text-blue-400">
                    <RefreshCw className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Generating Release Notes
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-lg">
                Our AI is analyzing the code changes and generating comprehensive release notes
                for both technical and marketing teams. This may take a moment...
              </p>
              <div className="flex gap-3 mt-2">
                <div className="px-3 py-1.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/30">
                  <Code className="h-3 w-3" />
                  <span>Analyzing code changes</span>
                </div>
                <div className="px-3 py-1.5 text-xs rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center gap-1.5 border border-purple-100 dark:border-purple-900/30">
                  <Zap className="h-3 w-3" />
                  <span>AI processing</span>
                </div>
              </div>
            </div>
          ) : normalizedNotes ? (
            <>
              {/* Tabs */}
              <Tabs 
                defaultValue="technical" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger 
                      value="technical"
                      className="flex items-center gap-1.5 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                    >
                      <Code className="h-4 w-4" />
                      <span>Technical Notes</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="marketing"
                      className="flex items-center gap-1.5 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Marketing Notes</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="technical" className="mt-0">
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Developer Documentation
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy("technical")}
                          className="flex items-center gap-1.5 h-8 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          {copied === "technical" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copied === "technical" ? "Copied" : "Copy"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("technical")}
                          className="flex items-center gap-1.5 h-8 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      ref={technicalNotesRef}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-96 font-mono text-sm"
                    >
                      {normalizedNotes.technicalNotes.split('\n').map((line: string, i: number) => (
                        <div key={i} className={cn(
                          "py-0.5",
                          line.startsWith('#') ? "text-blue-600 dark:text-blue-400 font-bold" : "",
                          line.startsWith('##') ? "text-blue-600 dark:text-blue-400 font-bold pl-2" : "",
                          line.startsWith('###') ? "text-blue-500 dark:text-blue-400 font-bold pl-4" : "",
                          line.startsWith('- ') ? "pl-2" : "",
                          line.startsWith('  - ') ? "pl-6" : "",
                          line.startsWith('```') ? "text-purple-600 dark:text-purple-400 font-bold" : "",
                          line.includes('`') && !line.startsWith('```') ? "text-green-600 dark:text-green-400" : ""
                        )}>
                          {line || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="marketing" className="mt-0">
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Marketing Release Notes
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy("marketing")}
                          className="flex items-center gap-1.5 h-8 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          {copied === "marketing" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copied === "marketing" ? "Copied" : "Copy"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("marketing")}
                          className="flex items-center gap-1.5 h-8 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      ref={marketingNotesRef}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-96"
                    >
                      {normalizedNotes.marketingNotes.split('\n').map((line: string, i: number) => (
                        <div key={i} className={cn(
                          "py-0.5",
                          line.startsWith('#') ? "text-purple-600 dark:text-purple-400 font-bold" : "",
                          line.startsWith('##') ? "text-purple-600 dark:text-purple-400 font-bold pl-2" : "",
                          line.startsWith('###') ? "text-purple-500 dark:text-purple-400 font-bold pl-4" : "",
                          line.startsWith('- ') ? "pl-2" : "",
                          line.startsWith('  - ') ? "pl-6" : ""
                        )}>
                          {line || "\u00A0"}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}