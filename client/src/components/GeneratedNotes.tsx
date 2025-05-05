import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Code, FileText, Maximize2, Download, Share2 } from "lucide-react";
import { PR, NotesData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateNotes } from "@/lib/github";
import { motion, AnimatePresence } from "framer-motion";

interface GeneratedNotesProps {
  selectedPR: PR | null;
  notes: NotesData;
  setNotes: (notes: NotesData) => void;
  isGeneratingNotes: boolean;
  setIsGeneratingNotes: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}

export default function GeneratedNotes({
  selectedPR,
  notes,
  setNotes,
  isGeneratingNotes,
  setIsGeneratingNotes,
  setError
}: GeneratedNotesProps) {
  const [activeTab, setActiveTab] = useState<"developer" | "marketing">("developer");
  const { toast } = useToast();
  const [generationProgress, setGenerationProgress] = useState({
    developer: 0,
    marketing: 0
  });
  const [activeGeneration, setActiveGeneration] = useState<"developer" | "marketing" | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // ID for scrolling to this section
  useEffect(() => {
    // Reset progress when starting fresh
    if (!isGeneratingNotes) {
      setGenerationProgress({ developer: 0, marketing: 0 });
      setActiveGeneration(null);
    }
  }, [isGeneratingNotes]);

  useEffect(() => {
    // Auto-scroll to this section when selected PR changes
    if (selectedPR && notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPR]);

  if (!selectedPR) return null;

  const handleGenerateNotes = async () => {
    if (!selectedPR) return;

    setIsGeneratingNotes(true);
    setNotes({ developer: "", marketing: "" });
    setError(null);
    setActiveGeneration("developer");

    try {
      // Create a streaming update handler with progress tracking
      const handleStreamUpdate = (type: string, content: string) => {
        if (type === "developer") {
          setActiveGeneration("developer");
          setNotes((prev: NotesData) => ({
            developer: prev.developer + content,
            marketing: prev.marketing
          }));
          // Simulate progress by assuming developer notes are 50% of total work
          setGenerationProgress(prev => ({ 
            ...prev, 
            developer: Math.min(prev.developer + 2, 100) 
          }));
        } else if (type === "marketing") {
          setActiveGeneration("marketing");
          setNotes((prev: NotesData) => ({
            developer: prev.developer,
            marketing: prev.marketing + content
          }));
          // Simulate progress for marketing notes
          setGenerationProgress(prev => ({ 
            ...prev, 
            marketing: Math.min(prev.marketing + 4, 100) 
          }));
        }
      };

      // Add some visual delay before starting
      await new Promise(resolve => setTimeout(resolve, 300));

      // Call the API with streaming support
      await generateNotes(
        selectedPR.base.repo.owner.login,
        selectedPR.base.repo.name,
        selectedPR.number,
        selectedPR.title,
        selectedPR.diff_url,
        selectedPR.diff_content, // Pass diff content if available from prefetch
        handleStreamUpdate
      );
      
      // Success toast notification with actions
      toast({
        title: "Release Notes Generated",
        description: "AI-powered notes are ready for your pull request.",
        variant: "default",
      });
      
      // Complete progress indicators
      setGenerationProgress({ developer: 100, marketing: 100 });
      setActiveGeneration(null);
      
    } catch (error) {
      console.error("Error generating notes:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      
      // Show error toast
      toast({
        title: "Error Generating Notes",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      // Reset notes if we have an error
      setNotes({ developer: "", marketing: "" });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Export notes function
  const exportNotes = () => {
    const tabContent = activeTab === "developer" ? notes.developer : notes.marketing;
    const fileName = `${selectedPR.base.repo.full_name.replace('/', '-')}-PR-${selectedPR.number}-${activeTab}-notes.html`;
    
    // Create a Blob and download it
    const blob = new Blob([tabContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Notes Exported",
      description: `Saved ${activeTab} notes as ${fileName}`,
    });
  };

  // Share notes function (copy link to clipboard)
  const shareNotes = () => {
    // In a real app, this would generate a shareable link
    // For now, we'll just copy the PR URL to clipboard
    const url = selectedPR.html_url || `https://github.com/${selectedPR.base.repo.full_name}/pull/${selectedPR.number}`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "PR link copied to clipboard. In a full implementation, this would create a shareable link to these notes.",
      });
    });
  };

  return (
    <section className="py-8 px-4" id="generate-notes-section" ref={notesRef}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-6 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full rotate-3"></div>
            <div className="relative flex items-center justify-center text-black h-7 w-7 rounded-full font-semibold text-sm mr-3 z-10">3</div>
          </div>
          <h2 className="text-xl font-semibold gradient-text">Generate Release Notes</h2>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="glass-card rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="text-lg font-medium mb-2">Selected Pull Request</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-start space-x-3">
                    <div className="w-full">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{selectedPR.title}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          #{selectedPR.number}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {selectedPR.body || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Button
                  className="bg-primary text-black font-medium hover:bg-primary/90 transition-all duration-200"
                  onClick={handleGenerateNotes}
                  disabled={isGeneratingNotes}
                >
                  {isGeneratingNotes ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingNotes ? "Generating..." : "Generate AI Notes"}
                </Button>
              </motion.div>
              
              {/* Generation in progress state */}
              <AnimatePresence>
                {isGeneratingNotes && (
                  <motion.div 
                    className="mt-8 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                          AI Generation in Progress
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        {/* Developer Notes Progress */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-sm font-medium">
                              <Code className="h-4 w-4 mr-1.5 text-blue-500" />
                              Developer Notes
                              {activeGeneration === "developer" && (
                                <span className="ml-2 text-blue-500 animate-pulse">
                                  • Processing
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{generationProgress.developer}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500"
                              initial={{ width: "0%" }}
                              animate={{ width: `${generationProgress.developer}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        
                        {/* Marketing Notes Progress */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-sm font-medium">
                              <FileText className="h-4 w-4 mr-1.5 text-green-500" />
                              Marketing Notes
                              {activeGeneration === "marketing" && (
                                <span className="ml-2 text-green-500 animate-pulse">
                                  • Processing
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{generationProgress.marketing}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-green-500"
                              initial={{ width: "0%" }}
                              animate={{ width: `${generationProgress.marketing}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                          Analyzing PR code changes and generating human-friendly summaries...
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Generated Notes */}
              <AnimatePresence>
                {!isGeneratingNotes && (notes.developer || notes.marketing) && (
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                          <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                          Release Notes
                        </h3>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={exportNotes}
                            className="text-xs h-8"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Export
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={shareNotes}
                            className="text-xs h-8"
                          >
                            <Share2 className="h-3.5 w-3.5 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        AI-generated release notes for PR #{selectedPR.number}
                      </p>
                    </div>
                    
                    <Tabs 
                      value={activeTab} 
                      onValueChange={(value) => setActiveTab(value as "developer" | "marketing")}
                      className="mt-2"
                    >
                      <TabsList className="mb-4 grid grid-cols-2 h-auto p-1">
                        <TabsTrigger value="developer" className="py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
                          <Code className="h-4 w-4 mr-2" />
                          Developer Notes
                        </TabsTrigger>
                        <TabsTrigger value="marketing" className="py-2.5 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-300">
                          <FileText className="h-4 w-4 mr-2" />
                          Marketing Notes
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="developer" className="pt-2 rounded-md">
                        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                              <Code className="h-4 w-4 mr-1.5" />
                              Technical Summary
                            </h4>
                            <CopyButton text={notes.developer} />
                          </div>
                          <div className="p-4 prose dark:prose-invert max-w-none overflow-auto max-h-[500px]" dangerouslySetInnerHTML={{ __html: notes.developer }} />
                        </div>
                      </TabsContent>

                      <TabsContent value="marketing" className="pt-2 rounded-md">
                        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-800">
                            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                              <FileText className="h-4 w-4 mr-1.5" />
                              User-Friendly Description
                            </h4>
                            <CopyButton text={notes.marketing} />
                          </div>
                          <div className="p-4 prose dark:prose-invert max-w-none overflow-auto max-h-[500px]" dangerouslySetInnerHTML={{ __html: notes.marketing }} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
