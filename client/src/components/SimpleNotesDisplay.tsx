import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateNotes } from '@/lib/github';
import { PR, NotesData } from '@/lib/types';
import { CopyButton } from '@/components/ui/copy-button';
// Import our custom CSS for styling
import '@/styles/modern-notes.css';
import '@/styles/notes-typography.css';
import '@/styles/animations.css';
import '@/styles/note-content.css';

// Global notes cache to ensure persistence
const notesCache: Record<number, NotesData> = {};

// Simple component to display HTML content
function HtmlContent({ html, type }: { html: string; type: 'developer' | 'marketing' }) {
  if (!html) return null;
  
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-20">
        <CopyButton 
          text={html}
          className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 
                   dark:hover:bg-gray-700/90 rounded-md shadow-md border border-gray-200/50 
                   dark:border-gray-700/50 transition-all duration-200 hover:scale-105"
        />
      </div>
      
      <div className={`
        prose dark:prose-invert max-w-none 
        prose-headings:font-bold 
        prose-p:mb-5 prose-p:leading-relaxed 
        prose-li:mb-2 
        prose-ul:ml-6 prose-ul:list-disc prose-ul:mb-5
        prose-ol:ml-6 prose-ol:list-decimal prose-ol:mb-5
        animate-fadeIn
        transition-opacity duration-300
        notes-formatted-html ${type}-content
      `}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

interface SimpleNotesDisplayProps {
  selectedPR: PR | null;
  notes: NotesData;
  setNotes: React.Dispatch<React.SetStateAction<NotesData>>; // ✅ updated line
  isGeneratingNotes: boolean;
  setIsGeneratingNotes: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}


export default function SimpleNotesDisplay({
  selectedPR,
  notes,
  setNotes,
  isGeneratingNotes,
  setIsGeneratingNotes,
  setError
}: SimpleNotesDisplayProps) {
  const [activeTab, setActiveTab] = useState<'developer' | 'marketing'>('developer');
  const [loadingProgress, setLoadingProgress] = useState({ developer: 0, marketing: 0 });
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // When PR changes, check if we have cached notes
  useEffect(() => {
    if (selectedPR && notesCache[selectedPR.number]) {
      // Restore from cache
      setNotes(notesCache[selectedPR.number]);
    }
  }, [selectedPR, setNotes]);
  
  // Auto-scroll when PR selected
  useEffect(() => {
    if (selectedPR && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPR]);

  // Function to generate notes
  const handleGenerateNotes = async () => {
    if (!selectedPR) return;
    
    try {
      // Reset notes and set loading state
      setNotes({ developer: '', marketing: '' });
      setIsGeneratingNotes(true);
      setError(null);
      setLoadingProgress({ developer: 0, marketing: 0 });
      
      // Extract repo and PR info
      const repoOwner = selectedPR.base.repo.owner.login;
      const repoName = selectedPR.base.repo.name;
      
      // Create streaming update handler with progress tracking
      const handleStreamUpdate = (type: string, content: string, status?: string, data?: any) => {
        if (type === "developer") {
          // For developer notes
          setNotes(prev => ({
            ...prev,
            developer: (prev.developer || '') + content
          }));
          
          // Update progress
          setLoadingProgress(prev => ({ 
            ...prev, 
            developer: Math.min(prev.developer + 2, 100) 
          }));
        } 
        else if (type === "marketing") {
          // For marketing notes
          setNotes(prev => ({
            ...prev,
            marketing: (prev.marketing || '') + content
          }));
          
          // Update progress
          setLoadingProgress(prev => ({ 
            ...prev, 
            marketing: Math.min(prev.marketing + 4, 100) 
          }));
        } 
        else if (type === "enrichment") {
          // Enrichment data updates if needed
          const enrichmentStatus = {
            inProgress: status !== "complete" && status !== "error",
            message: content,
            ...(status === "error" ? { error: content } : {})
          };
          
          if (data) {
            setNotes(prev => ({
              ...prev,
              enrichmentStatus,
              enrichedData: { ...prev.enrichedData, ...data }
            }));
          } else {
            setNotes(prev => ({ ...prev, enrichmentStatus }));
          }
        }
      };
      
      // Call API to generate notes
      await generateNotes(
        repoOwner,
        repoName,
        selectedPR.number,
        selectedPR.title,
        selectedPR.diff_content || '',
        selectedPR.diff_content || '',
        handleStreamUpdate
      );
      
      // Store completed notes in cache
      setNotes(currentNotes => {
        notesCache[selectedPR.number] = currentNotes;
        console.log('Notes stored in cache for PR #' + selectedPR.number);
        return currentNotes;
      });
      
      // Complete generation
      setIsGeneratingNotes(false);
      
      // Show success message
      toast({
        title: "Notes Generated!",
        description: "The AI-powered notes have been generated successfully."
      });
      
    } catch (error) {
      setIsGeneratingNotes(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate notes";
      console.error("Error generating notes:", error);
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage
      });
    }
  };

  // If no PR selected, don't render
  if (!selectedPR) return null;

  // Check if we have content
  const hasDeveloperContent = notes.developer && notes.developer.trim() !== '';
  const hasMarketingContent = notes.marketing && notes.marketing.trim() !== '';
  
  // Get content from cache or state
  const developerContent = 
    notes.developer || 
    (selectedPR && notesCache[selectedPR.number]?.developer) || 
    '';
    
  const marketingContent = 
    notes.marketing || 
    (selectedPR && notesCache[selectedPR.number]?.marketing) || 
    '';

  return (
    <div ref={containerRef} className="mt-8">
      <div className="relative overflow-hidden dark:bg-gradient-to-br dark:from-gray-900 dark:via-[#0f172a] dark:to-[#131f37] 
                      bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-1 shadow-2xl 
                      animate-fadeInUp dark:border-white/5 border-gray-200 animate-border-glow">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl animate-gradient"></div>
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blue-500/10 backdrop-blur-lg"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-indigo-500/10 backdrop-blur-lg"></div>
        
        {/* Main content */}
        <div className="backdrop-blur-sm dark:bg-black/30 bg-white/60 p-6 lg:p-8 rounded-lg dark:border-white/5 border-gray-200/50 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-2xl font-bold text-gradient text-gradient-blue-purple">
              Generated Notes
            </h2>
            <Button
              onClick={handleGenerateNotes}
              disabled={isGeneratingNotes}
              className={`relative overflow-hidden group ${isGeneratingNotes ? 
                'bg-gray-700 cursor-not-allowed' : 
                'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500'} 
                text-white font-medium px-6 py-2.5 rounded-lg shadow-lg transition-all duration-300`}
            >
              {isGeneratingNotes ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Notes
                </span>
              }
            </Button>
          </div>
          
          {/* Enrichment status if available */}
          {notes.enrichmentStatus?.inProgress && (
            <div className="mb-6 p-4 bg-indigo-900/20 backdrop-blur-sm rounded-lg border border-indigo-500/30 text-blue-300 animate-fadeInUp">
              <p className="flex items-center text-sm">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3 bg-indigo-500/20 rounded-full">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span className="font-medium">{notes.enrichmentStatus.message}</span>
              </p>
            </div>
          )}
          
          {/* Tabs */}
          <div className="notes-tabs">
            <div className="flex p-1 mb-6 dark:bg-gray-800/40 bg-gray-100/70 backdrop-blur-sm rounded-lg overflow-hidden dark:border-white/5 border-gray-300/50">
              <button
                onClick={() => setActiveTab("developer")}
                className={`flex-1 relative py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === "developer" 
                    ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Developer Notes
                  {isGeneratingNotes && activeTab === "developer" && (
                    <span className="ml-2 text-xs bg-blue-800 rounded-full px-2 py-0.5">{loadingProgress.developer}%</span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex-1 relative py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === "marketing" 
                    ? "bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white shadow-lg" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Marketing Notes
                  {isGeneratingNotes && activeTab === "marketing" && (
                    <span className="ml-2 text-xs bg-green-800 rounded-full px-2 py-0.5">{loadingProgress.marketing}%</span>
                  )}
                </div>
              </button>
            </div>

            {/* Content area */}
            <div className="min-h-[300px]">
              {activeTab === "developer" && (
                <>
                  {/* Developer notes content */}
                  {hasDeveloperContent && !isGeneratingNotes ? (
                    <div className="notes-wrapper animate-fadeIn relative overflow-hidden rounded-xl">
                      <div className="relative rounded-xl bg-gradient-to-b from-blue-900/10 to-blue-600/5 overflow-hidden shadow-xl border border-blue-500/30">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"></div>
                        <div className="p-6 lg:p-8 dark:bg-gray-900/70 bg-white/90">
                          <HtmlContent html={developerContent} type="developer" />
                        </div>
                      </div>
                    </div>
                  ) : isGeneratingNotes ? (
                    <div className="bg-gradient-to-br dark:from-gray-900/80 dark:to-blue-900/20 from-gray-200/90 to-blue-100/30 backdrop-blur-sm border border-blue-300/30 dark:border-blue-500/20 rounded-xl p-6 min-h-[200px] shadow-lg animate-pulse">
                      <div className="space-y-4">
                        {[3/4, 1, 2/3, 3/4, 5/6].map((width, i) => (
                          <div 
                            key={i} 
                            className="h-2 bg-blue-400/30 dark:bg-blue-700/10 rounded-full animate-pulse" 
                            style={{
                              width: `${width * 100}%`, 
                              animationDelay: `${i * 0.15}s`,
                              opacity: 0.5 + (i * 0.1)
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br dark:from-gray-900/80 dark:to-blue-900/10 from-gray-200 to-blue-100/40 backdrop-blur-sm border border-blue-300/30 dark:border-gray-700/30 rounded-xl p-8 text-center">
                      <div>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600/30 to-blue-900/40 backdrop-blur-sm flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg">
                          <svg className="h-8 w-8 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Developer Notes</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-400 max-w-md mx-auto">Generate technical documentation explaining code changes, implementation details, and architectural decisions.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "marketing" && (
                <>
                  {/* Marketing notes content */}
                  {hasMarketingContent && !isGeneratingNotes ? (
                    <div className="notes-wrapper animate-fadeIn relative overflow-hidden rounded-xl">
                      <div className="relative rounded-xl bg-gradient-to-b from-green-900/10 to-green-600/5 overflow-hidden shadow-xl border border-green-500/30">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 via-green-500 to-green-600"></div>
                        <div className="p-6 lg:p-8 dark:bg-gray-900/70 bg-white/90">
                          <HtmlContent html={marketingContent} type="marketing" />
                        </div>
                      </div>
                    </div>
                  ) : isGeneratingNotes ? (
                    <div className="bg-gradient-to-br dark:from-gray-900/80 dark:to-green-900/20 from-gray-200/90 to-green-100/30 backdrop-blur-sm border border-green-300/30 dark:border-green-500/20 rounded-xl p-6 min-h-[200px] shadow-lg animate-pulse">
                      <div className="space-y-4">
                        {[3/4, 1, 2/3, 3/4, 5/6].map((width, i) => (
                          <div 
                            key={i} 
                            className="h-2 bg-green-400/30 dark:bg-green-700/10 rounded-full animate-pulse" 
                            style={{
                              width: `${width * 100}%`, 
                              animationDelay: `${i * 0.15}s`,
                              opacity: 0.5 + (i * 0.1)
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br dark:from-gray-900/80 dark:to-green-900/10 from-gray-200 to-green-100/40 backdrop-blur-sm border border-green-300/30 dark:border-gray-700/30 rounded-xl p-8 text-center">
                      <div>
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-600/30 to-green-900/40 backdrop-blur-sm flex items-center justify-center mb-4 border border-green-500/30 shadow-lg">
                          <svg className="h-8 w-8 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Marketing Notes</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-400 max-w-md mx-auto">Create user-friendly release notes highlighting benefits, improvements, and value delivered to stakeholders.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}