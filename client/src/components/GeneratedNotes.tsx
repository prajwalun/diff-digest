import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/hooks/use-toast';
import { generateNotes } from '@/lib/github';
import { PR } from '@/lib/types';
import { CopyButton } from '@/components/ui/copy-button';
// Import our custom CSS for styling
import '@/styles/modern-notes.css';
import '@/styles/notes-typography.css';
import '@/styles/animations.css';
import '@/styles/note-content.css';

interface NotesData {
  developer: string;
  marketing: string;
  enrichmentStatus?: {
    inProgress: boolean;
    message: string;
    error?: string;
  };
  enrichedData?: {
    relatedIssues?: Array<{ number: number; title: string; url: string }>;
    fileStats?: {
      added: number;
      modified: number;
      removed: number;
      totalAdditions: number;
      totalDeletions: number;
      keyFiles: Array<{ name: string; additions: number; deletions: number }>;
    };
    repoStats?: {
      stars: number;
      forks: number;
      language: string;
    };
  };
}

// A more robust HTML sanitizer to handle malformed HTML
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove any potential script tags or dangerous attributes
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '');
  
  // Handle unclosed tags by closing them
  if (!isHtmlBalanced(html)) {
    // Find all opening tags
    const openTags: string[] = [];
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9\-_]*)[^>]*>|<\/([a-zA-Z][a-zA-Z0-9\-_]*)[^>]*>/g;
    
    // Self-closing tags that don't need matching end tags
    const selfClosingTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);
    
    let match;
    let inTag = false;
    let hasUnclosedTags = false;
    
    while ((match = tagRegex.exec(html)) !== null) {
      // Opening tag
      if (match[1]) {
        const tagName = match[1].toLowerCase();
        // Skip self-closing tags
        if (!selfClosingTags.has(tagName) && !match[0].endsWith('/>')) {
          openTags.push(tagName);
        }
      } 
      // Closing tag
      else if (match[2]) {
        const tagName = match[2].toLowerCase();
        // Pop the last matching open tag
        for (let i = openTags.length - 1; i >= 0; i--) {
          if (openTags[i] === tagName) {
            openTags.splice(i, 1);
            break;
          }
        }
      }
    }
    
    // Close any remaining open tags in reverse order
    if (openTags.length > 0) {
      hasUnclosedTags = true;
      let closingTags = '';
      for (let i = openTags.length - 1; i >= 0; i--) {
        closingTags += `</${openTags[i]}>`;
      }
      html += closingTags;
    }
    
    // If we still have unbalanced tags after our attempt, wrap everything in a div
    if (hasUnclosedTags && !isHtmlBalanced(html)) {
      html = `<div>${html}</div>`;
    }
  }
  
  return html;
}

// Helper to check if HTML tags are balanced
function isHtmlBalanced(html: string): boolean {
  // Handle empty or non-HTML content
  if (!html || !html.includes('<')) return true;
  
  // Self-closing tags that don't need matching end tags
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  
  // Void elements that don't need closing tags in HTML5
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  
  const stack: string[] = [];
  let inTag = false;
  let inComment = false;
  let currentTag = '';
  let insideQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    // Handle comments
    if (inTag && !inComment && currentTag === '!' && html.slice(i, i+2) === '--') {
      inComment = true;
      i++; // Skip the second dash
      continue;
    }
    
    if (inComment) {
      if (html.slice(i, i+3) === '-->') {
        inComment = false;
        inTag = false;
        currentTag = '';
        i += 2; // Skip the rest of -->
      }
      continue;
    }
    
    // Handle quotes inside tags
    if (inTag && (char === '"' || char === "'") && 
        (!insideQuote || quoteChar === char) &&
        (i === 0 || html[i-1] !== '\\')) {
      insideQuote = !insideQuote;
      if (insideQuote) quoteChar = char;
      continue;
    }
    
    // Skip processing inside quotes
    if (insideQuote) continue;
    
    if (char === '<' && !inTag) {
      inTag = true;
      currentTag = '';
    } else if (char === '>' && inTag) {
      inTag = false;
      
      // Ignore doctype or comments
      if (currentTag.startsWith('!')) {
        currentTag = '';
        continue;
      }
      
      // Extract just the tag name, handling attributes
      const tagMatch = currentTag.match(/^\/?([a-zA-Z][a-zA-Z0-9\-_]*)/i);
      if (!tagMatch) {
        // Malformed tag, ignore it
        currentTag = '';
        continue;
      }
      
      const tagName = tagMatch[1].toLowerCase();
      
      // Skip invalid HTML elements
      if (!tagName) {
        currentTag = '';
        continue;
      }
      
      if (currentTag.startsWith('/')) {
        // Closing tag
        if (stack.length === 0 || stack.pop() !== tagName) {
          return false; // Unbalanced
        }
      } else if (currentTag.endsWith('/') || selfClosingTags.has(tagName)) {
        // Self-closing tag, no need to push to stack
      } else if (!voidElements.has(tagName)) {
        // Regular opening tag
        stack.push(tagName);
      }
      
      currentTag = '';
    } else if (inTag) {
      currentTag += char;
    }
  }
  
  // If we're still in a tag or have unclosed tags, it's not balanced
  return !inTag && !inComment && stack.length === 0;
}

// Simplified HTML display component for reliable rendering
function RawHtmlDisplay({ html, type = "developer", isGenerating = false }: { 
  html: string; 
  type?: "developer" | "marketing";
  isGenerating?: boolean;
}) {
  // No content, no display
  if (!html) return null;
  
  console.log(`Displaying ${type} content, length: ${html.length}`);
  
  // Sanitize the HTML to ensure it's properly structured
  const sanitized = html && sanitizeHtml ? sanitizeHtml(html) : html;
  
  return (
    <>
      {/* Copy button */}
      {html && !isGenerating && (
        <div className="absolute top-3 right-3 z-20">
          <CopyButton 
            text={html}
            className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 rounded-md shadow-md border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:scale-105"
          />
        </div>
      )}
      
      {/* Content with direct rendering */}
      <div 
        className={`
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
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </>
  );
}

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
  // Cache to store successfully generated notes
  const cachedNotesRef = useRef<{developer: string, marketing: string}>({
    developer: '',
    marketing: ''
  });
  const [activeTab, setActiveTab] = useState("developer");
  const [activeGeneration, setActiveGeneration] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState({
    developer: 0,
    marketing: 0
  });
  
  // Add these buffers for HTML tag handling
  const [developerBuffer, setDeveloperBuffer] = useState("");
  const [marketingBuffer, setMarketingBuffer] = useState("");
  
  // Create persistent refs to store the final notes content
  const persistedNotesRef = useRef<NotesData>({
    developer: notes.developer || "",
    marketing: notes.marketing || ""
  });
  
  const { toast } = useToast();
  const notesRef = useRef<HTMLDivElement>(null);
  
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
  
  // Effect to maintain persistence between existing notes and our ref
  useEffect(() => {
    if (notes.developer && notes.developer.trim() !== "") {
      persistedNotesRef.current.developer = notes.developer;
    }
    if (notes.marketing && notes.marketing.trim() !== "") {
      persistedNotesRef.current.marketing = notes.marketing;
    }
  }, [notes.developer, notes.marketing]);
  
  // Process incoming chunks to ensure complete HTML tags - improved version
  const processHtmlChunk = (existingHtml: string, newChunk: string, type: "developer" | "marketing") => {
    try {
      // Get the appropriate buffer
      const buffer = type === "developer" ? developerBuffer : marketingBuffer;
      
      // Combine with any existing buffer
      const combinedChunk = buffer + newChunk;
      
      // Simplified approach - we'll always append the chunk to avoid flickering
      // But we'll only clear the buffer if the HTML is balanced
      if (isHtmlBalanced(combinedChunk)) {
        if (type === "developer") {
          setDeveloperBuffer("");
        } else {
          setMarketingBuffer("");
        }
      } else {
        // Store in buffer for next chunk
        if (type === "developer") {
          setDeveloperBuffer(combinedChunk);
        } else {
          setMarketingBuffer(combinedChunk);
        }
      }
      
      // Always return the combined content to avoid UI jumping
      return existingHtml + newChunk;
    } catch (error) {
      console.error("Error processing HTML chunk:", error);
      // On error, just append the chunk directly
      return existingHtml + newChunk;
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedPR) return;
    
    try {
      // Reset notes and set generating state
      setNotes({
        developer: '',
        marketing: '',
      });
      setIsGeneratingNotes(true);
      setError(null);
      setGenerationProgress({ developer: 0, marketing: 0 });
      setDeveloperBuffer(""); // Clear any previous buffers
      setMarketingBuffer("");
      
      // Extract repo and PR info from the selected PR
      const prUrl = selectedPR.html_url || selectedPR._links?.html?.href || '';
      const repoParts = prUrl.split('/');
      const repoOwner = selectedPR.base.repo.owner.login;
      const repoName = selectedPR.base.repo.name;
      
      // Create a streaming update handler with progress tracking
      const handleStreamUpdate = (type: string, content: string, status?: string, data?: any) => {
        if (type === "developer") {
          setActiveGeneration("developer");
          // We need to use a functional update to ensure we always have the latest state
          setNotes(prevNotes => {
            const updatedNotes = { ...prevNotes };
            updatedNotes.developer = processHtmlChunk(prevNotes.developer || "", content, "developer");
            return updatedNotes;
          });
          
          // Simulate progress by assuming developer notes are 50% of total work
          setGenerationProgress(prev => ({ 
            ...prev, 
            developer: Math.min(prev.developer + 2, 100) 
          }));
        } else if (type === "marketing") {
          setActiveGeneration("marketing");
          // Use functional update for marketing notes too
          setNotes(prevNotes => {
            const updatedNotes = { ...prevNotes };
            updatedNotes.marketing = processHtmlChunk(prevNotes.marketing || "", content, "marketing");
            return updatedNotes;
          });
          
          // Simulate progress for marketing notes
          setGenerationProgress(prev => ({ 
            ...prev, 
            marketing: Math.min(prev.marketing + 4, 100) 
          }));
        } else if (type === "enrichment") {
          // Handle enrichment status updates
          const enrichmentStatus = {
            inProgress: status !== "complete" && status !== "error",
            message: content,
            ...(status === "error" ? { error: content } : {})
          };
            
          // Prepare enriched data if available
          if (data) {
            setNotes(prevNotes => {
              const updatedNotes = { ...prevNotes };
              updatedNotes.enrichmentStatus = enrichmentStatus;
              updatedNotes.enrichedData = {
                ...prevNotes.enrichedData,
                ...data
              };
              return updatedNotes;
            });
          } else {
            setNotes(prevNotes => {
              const updatedNotes = { ...prevNotes };
              updatedNotes.enrichmentStatus = enrichmentStatus;
              return updatedNotes;
            });
          }
        }
      };
      
      // Call the API with streaming callback
      await generateNotes(
        repoOwner,
        repoName,
        selectedPR.number,
        selectedPR.title,
        selectedPR.diff_content || '',
        selectedPR.diff_content || '', // Pass diff content directly as well
        handleStreamUpdate
      );
      
      // Once complete, flush any remaining buffers and save the final content
      const finalDeveloperContent = notes.developer + (developerBuffer || "");
      const finalMarketingContent = notes.marketing + (marketingBuffer || "");
      
      // Store in our persistent ref
      persistedNotesRef.current = {
        ...persistedNotesRef.current,
        developer: finalDeveloperContent,
        marketing: finalMarketingContent
      };
      
      console.log("Generation complete! Final content stored in ref");
      
      // Update notes with the final content - use functional update for consistency
      setNotes(prevNotes => {
        return {
          ...prevNotes,
          developer: finalDeveloperContent,
          marketing: finalMarketingContent
        };
      });
      
      // Store in our cache for reliability
      cachedNotesRef.current = {
        developer: finalDeveloperContent,
        marketing: finalMarketingContent
      };
      
      // Important: After generation completes and before setting isGeneratingNotes to false,
      // ensure we have the content available in the main state
      setTimeout(() => {
        setNotes(current => {
          // If for some reason the notes got cleared, restore them from our refs
          if (!current.developer || current.developer.trim() === "") {
            return {
              ...current,
              developer: persistedNotesRef.current.developer,
              marketing: persistedNotesRef.current.marketing
            };
          }
          return current;
        });
      }, 100);
      
      // Clear buffers
      setDeveloperBuffer("");
      setMarketingBuffer("");
      
      // Set generation as complete - this is important to enable the display
      setIsGeneratingNotes(false);
      
      // Show success toast
      toast({
        title: "Notes Generated!",
        description: "The AI-powered notes for this PR have been generated.",
      });
      
    } catch (error) {
      setIsGeneratingNotes(false);
      console.error("Error generating notes:", error);
      setError(error instanceof Error ? error.message : "Failed to generate notes");
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate notes",
      });
    }
  };

  if (!selectedPR) return null;

  return (
    <div ref={notesRef} className="mt-8">
      <div className="relative overflow-hidden dark:bg-gradient-to-br dark:from-gray-900 dark:via-[#0f172a] dark:to-[#131f37] bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-1 shadow-2xl animate-fadeInUp dark:border-white/5 border-gray-200 animate-border-glow animate-float">
        {/* Animated Glassmorphism Design Elements */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl animate-gradient"></div>
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blue-500/10 backdrop-blur-lg"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-indigo-500/10 backdrop-blur-lg"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-1/4 right-10 w-3 h-3 rounded-full bg-blue-500/30 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-10 w-2 h-2 rounded-full bg-purple-500/30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-indigo-500/30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Main Content with enhanced glassmorphism effect */}
        <div className="backdrop-blur-sm dark:bg-black/30 bg-white/60 p-6 lg:p-8 rounded-lg dark:border-white/5 border-gray-200/50 relative z-10">
          {/* Header with animated gradient text */}
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-2xl font-bold text-gradient text-gradient-blue-purple">
              Generated Notes
            </h2>
            <Button
              onClick={handleGenerateNotes}
              disabled={isGeneratingNotes}
              className={`relative overflow-hidden group button-shine ${isGeneratingNotes ? 
                'bg-gray-700 cursor-not-allowed' : 
                'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500'} 
                text-white font-medium px-6 py-2.5 rounded-lg shadow-lg transition-all duration-300 ${!isGeneratingNotes && 'animate-glow-blue'}`}
            >
              {/* Advanced Button effect */}
              <span className="absolute inset-0 rounded-lg overflow-hidden">
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-full transition-all duration-1000 ease-out"></span>
              </span>
              
              {isGeneratingNotes ? (
                <span className="flex items-center relative z-10">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating
                  <span className="inline-flex ml-1">
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                  </span>
                </span>
              ) : 
                <span className="flex items-center relative z-10">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Notes
                </span>
              }
            </Button>
          </div>
          
          {/* Enrichment data display */}
          {notes.enrichmentStatus && notes.enrichmentStatus.inProgress && (
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
          
          {/* Custom Tabs with modern design */}
          <div className="notes-tabs">
            <div className="flex p-1 mb-6 dark:bg-gray-800/40 bg-gray-100/70 backdrop-blur-sm rounded-lg overflow-hidden dark:border-white/5 border-gray-300/50">
              <button
                onClick={() => setActiveTab("developer")}
                className={`flex-1 relative py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === "developer" 
                    ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg" 
                    : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Developer Notes
                  {activeGeneration === "developer" && (
                    <span className="ml-2 text-xs bg-blue-800 rounded-full px-2 py-0.5 shimmer">{generationProgress.developer}%</span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("marketing")}
                className={`flex-1 relative py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                  activeTab === "marketing" 
                    ? "bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white shadow-lg" 
                    : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Marketing Notes
                  {activeGeneration === "marketing" && (
                    <span className="ml-2 text-xs bg-green-800 rounded-full px-2 py-0.5 shimmer">{generationProgress.marketing}%</span>
                  )}
                </div>
              </button>
            </div>

            {/* Tab Content with Improved Smooth Transitions */}
            <div className="tab-content relative min-h-[300px]">
              {/* Developer Notes */}
              <div className={`transition-all duration-300 ease-in-out transform absolute w-full ${activeTab === "developer" 
                ? "opacity-100 translate-x-0 scale-100 z-10" 
                : "opacity-0 -translate-x-8 scale-95 pointer-events-none z-0"}`}
              >
                {/* Content only shown when not generating */}
                {/* Check all possible sources for content: notes state, persisted ref, and cache ref */}
                {((notes.developer && notes.developer.trim() !== "") || 
                  (persistedNotesRef.current.developer && persistedNotesRef.current.developer.trim() !== "") ||
                  (cachedNotesRef.current.developer && cachedNotesRef.current.developer.trim() !== "")) 
                  && !isGeneratingNotes ? (
                  <div className="notes-wrapper animate-fadeInUp relative overflow-hidden rounded-xl">
                    {/* Content container with styling for developer notes */}
                    <div className="relative rounded-xl backdrop-blur-sm bg-gradient-to-b from-blue-900/10 to-blue-600/5 overflow-hidden shadow-xl border border-blue-500/30">
                      {/* Side indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"></div>
                    
                      {/* Content container with direct styling */}
                      <div className="p-6 lg:p-8 dark:bg-gray-900/70 bg-white/90">
                        <RawHtmlDisplay 
                          html={notes.developer || persistedNotesRef.current.developer || cachedNotesRef.current.developer} 
                          type="developer" 
                          isGenerating={false} 
                        />
                      </div>
                    </div>
                  </div>
                ) : isGeneratingNotes ? (
                  <div className="bg-gradient-to-br dark:from-gray-900/80 dark:to-blue-900/20 from-gray-200/90 to-blue-100/30 backdrop-blur-sm border border-blue-300/30 dark:border-blue-500/20 rounded-xl p-6 min-h-[200px] shadow-lg shadow-blue-900/5 animate-pulse">
                    {/* Animated loading placeholder */}
                    <div className="flex space-x-3 items-center mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br dark:from-blue-700/30 dark:to-blue-600/10 from-blue-400/30 to-blue-300/20 flex items-center justify-center animate-pulse">
                        <svg className="h-6 w-6 text-blue-500/60 dark:text-blue-500/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-blue-500/30 dark:bg-blue-700/20 rounded-full w-1/3"></div>
                        <div className="h-2 bg-blue-400/30 dark:bg-blue-600/20 rounded-full w-1/4"></div>
                      </div>
                    </div>
                    
                    {/* Animated loading lines with cascading animation */}
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
                    
                    {/* Animated loading bullet points */}
                    <div className="mt-6 space-y-3">
                      {[1/2, 2/3, 3/5].map((width, i) => (
                        <div key={i} className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full bg-blue-400/40 dark:bg-blue-700/20 mr-2 animate-pulse" 
                            style={{ animationDelay: `${i * 0.3}s` }}
                          ></div>
                          <div 
                            className="h-2 bg-blue-400/30 dark:bg-blue-700/10 rounded-full animate-pulse" 
                            style={{ 
                              width: `${width * 100}%`, 
                              animationDelay: `${i * 0.3}s` 
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Subtle pulsing dots to indicate progress */}
                    <div className="absolute bottom-4 right-4 flex space-x-1">
                      {[0, 0.5, 1].map((delay, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full bg-blue-500/60 dark:bg-blue-500/40 animate-pulse"
                          style={{ animationDelay: `${delay}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                ) : (
                  <div className="relative bg-gradient-to-br dark:from-gray-900/80 dark:to-blue-900/10 from-gray-200 to-blue-100/40 backdrop-blur-sm border border-blue-300/30 dark:border-gray-700/30 rounded-xl p-8 text-center overflow-hidden group">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-gradient"></div>
                    
                    <div className="animate-float">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-600/30 to-blue-900/40 backdrop-blur-sm flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg shadow-blue-900/5">
                        <svg className="h-8 w-8 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-300 dark:to-blue-500">Developer Notes</h3>
                      <p className="mt-2 text-gray-700 dark:text-gray-400 max-w-md mx-auto">Generate technical documentation explaining code changes, implementation details, and architectural decisions.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Marketing Notes with smoother transitions */}
              <div className={`transition-all duration-300 ease-in-out transform absolute w-full ${activeTab === "marketing" 
                ? "opacity-100 translate-x-0 scale-100 z-10" 
                : "opacity-0 translate-x-8 scale-95 pointer-events-none z-0"}`}
              >
                {/* Displaying notes or loading UI based on generation state - check all sources */}
                {((notes.marketing && notes.marketing.trim() !== "") || 
                  (persistedNotesRef.current.marketing && persistedNotesRef.current.marketing.trim() !== "") ||
                  (cachedNotesRef.current.marketing && cachedNotesRef.current.marketing.trim() !== "")) 
                  && !isGeneratingNotes ? (
                  <div className="notes-wrapper animate-fadeInUp relative overflow-hidden rounded-xl">
                    {/* Content container with styling for marketing notes */}
                    <div className="relative rounded-xl backdrop-blur-sm bg-gradient-to-b from-green-900/10 to-green-600/5 overflow-hidden shadow-xl border border-green-500/30">
                      {/* Side indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 via-green-500 to-green-600"></div>
                      
                      {/* Content container with direct styling */}
                      <div className="p-6 lg:p-8 dark:bg-gray-900/70 bg-white/90">
                        <RawHtmlDisplay 
                          html={notes.marketing || persistedNotesRef.current.marketing || cachedNotesRef.current.marketing} 
                          type="marketing"
                          isGenerating={false} 
                        />
                      </div>
                    </div>
                  </div>
                ) : isGeneratingNotes ? (
                  <div className="bg-gradient-to-br dark:from-gray-900/80 dark:to-green-900/20 from-gray-200/90 to-green-100/30 backdrop-blur-sm border border-green-300/30 dark:border-green-500/20 rounded-xl p-6 min-h-[200px] shadow-lg shadow-green-900/5 animate-pulse">
                    {/* Animated loading placeholder */}
                    <div className="flex space-x-3 items-center mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br dark:from-green-700/30 dark:to-green-600/10 from-green-400/30 to-green-300/20 flex items-center justify-center animate-pulse">
                        <svg className="h-6 w-6 text-green-500/60 dark:text-green-500/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-green-500/30 dark:bg-green-700/20 rounded-full w-1/3"></div>
                        <div className="h-2 bg-green-400/30 dark:bg-green-600/20 rounded-full w-1/4"></div>
                      </div>
                    </div>
                    
                    {/* Animated loading lines with cascading animation */}
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
                    
                    {/* Animated loading bullet points */}
                    <div className="mt-6 space-y-3">
                      {[1/2, 2/3, 3/5].map((width, i) => (
                        <div key={i} className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full bg-green-400/40 dark:bg-green-700/20 mr-2 animate-pulse" 
                            style={{ animationDelay: `${i * 0.3}s` }}
                          ></div>
                          <div 
                            className="h-2 bg-green-400/30 dark:bg-green-700/10 rounded-full animate-pulse" 
                            style={{ 
                              width: `${width * 100}%`, 
                              animationDelay: `${i * 0.3}s` 
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Subtle pulsing dots to indicate progress */}
                    <div className="absolute bottom-4 right-4 flex space-x-1">
                      {[0, 0.5, 1].map((delay, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full bg-green-500/60 dark:bg-green-500/40 animate-pulse"
                          style={{ animationDelay: `${delay}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>

                ) : (
                  <div className="relative bg-gradient-to-br dark:from-gray-900/80 dark:to-green-900/10 from-gray-200 to-green-100/40 backdrop-blur-sm border border-green-300/30 dark:border-gray-700/30 rounded-xl p-8 text-center overflow-hidden group">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-gradient"></div>
                    
                    <div className="animate-float">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-600/30 to-green-900/40 backdrop-blur-sm flex items-center justify-center mb-4 border border-green-500/30 shadow-lg shadow-green-900/5">
                        <svg className="h-8 w-8 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-green-300 dark:to-green-500">Marketing Notes</h3>
                      <p className="mt-2 text-gray-700 dark:text-gray-400 max-w-md mx-auto">Create user-friendly release notes highlighting benefits, improvements, and value delivered to stakeholders.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}