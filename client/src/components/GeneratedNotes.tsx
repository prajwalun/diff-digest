import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/hooks/use-toast';
import { generateNotes } from '@/lib/github';
import { PR, NotesData } from '@/lib/types';
import { CopyButton } from '@/components/ui/copy-button';

import '@/styles/modern-notes.css';
import '@/styles/notes-typography.css';
import '@/styles/animations.css';
import '@/styles/note-content.css';

function sanitizeHtml(html: string): string {
  if (!html) return '';
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '');
  return html;
}

function isHtmlBalanced(html: string): boolean {
  if (!html || !html.includes('<')) return true;
  const stack: string[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const [tag, tagName] = match;
    if (tag[1] === '/') {
      if (stack.pop() !== tagName) return false;
    } else if (!tag.endsWith('/>')) {
      stack.push(tagName);
    }
  }
  return stack.length === 0;
}

function RawHtmlDisplay({ html, type = "developer", isGenerating = false }: {
  html: string;
  type?: "developer" | "marketing";
  isGenerating?: boolean;
}) {
  if (!html) return null;
  const sanitized = sanitizeHtml(html);
  return (
    <>
      {!isGenerating && (
        <div className="absolute top-3 right-3 z-20">
          <CopyButton
            text={html}
            className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 rounded-md shadow-md border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:scale-105"
          />
        </div>
      )}
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
  setNotes: React.Dispatch<React.SetStateAction<NotesData>>; // ✅ FIXED HERE
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
  const cachedNotesRef = useRef<{ developer: string, marketing: string }>({
    developer: '',
    marketing: ''
  });
  const [activeTab, setActiveTab] = useState("developer");
  const [generationProgress, setGenerationProgress] = useState({ developer: 0, marketing: 0 });
  const [developerBuffer, setDeveloperBuffer] = useState("");
  const [marketingBuffer, setMarketingBuffer] = useState("");
  const persistedNotesRef = useRef<NotesData>({ developer: notes.developer || "", marketing: notes.marketing || "" });
  const { toast } = useToast();
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGeneratingNotes) {
      setGenerationProgress({ developer: 0, marketing: 0 });
    }
  }, [isGeneratingNotes]);

  useEffect(() => {
    if (selectedPR && notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPR]);

  useEffect(() => {
    if (notes.developer?.trim()) persistedNotesRef.current.developer = notes.developer;
    if (notes.marketing?.trim()) persistedNotesRef.current.marketing = notes.marketing;
  }, [notes]);

  const processHtmlChunk = (existingHtml: string, newChunk: string, type: "developer" | "marketing") => {
    const buffer = type === "developer" ? developerBuffer : marketingBuffer;
    const combined = buffer + newChunk;
    if (isHtmlBalanced(combined)) {
      if (type === "developer") setDeveloperBuffer("");
      else setMarketingBuffer("");
    } else {
      if (type === "developer") setDeveloperBuffer(combined);
      else setMarketingBuffer(combined);
    }
    return existingHtml + newChunk;
  };

  const handleGenerateNotes = async () => {
    if (!selectedPR) return;
    try {
      setNotes({ developer: '', marketing: '' });
      setIsGeneratingNotes(true);
      setError(null);
      setGenerationProgress({ developer: 0, marketing: 0 });
      setDeveloperBuffer("");
      setMarketingBuffer("");

      const prUrl = selectedPR.html_url || selectedPR._links?.html?.href || '';
      const repoOwner = selectedPR.base.repo.owner.login;
      const repoName = selectedPR.base.repo.name;

      const handleStreamUpdate = (type: string, content: string, status?: string, data?: any) => {
        if (type === "developer") {
          setNotes(prev => ({
            ...prev,
            developer: processHtmlChunk(prev.developer || "", content, "developer")
          }));
          setGenerationProgress(prev => ({ ...prev, developer: Math.min(prev.developer + 2, 100) }));
        } else if (type === "marketing") {
          setNotes(prev => ({
            ...prev,
            marketing: processHtmlChunk(prev.marketing || "", content, "marketing")
          }));
          setGenerationProgress(prev => ({ ...prev, marketing: Math.min(prev.marketing + 4, 100) }));
        } else if (type === "enrichment") {
          const enrichmentStatus = {
            inProgress: status !== "complete" && status !== "error",
            message: content,
            ...(status === "error" ? { error: content } : {})
          };
          setNotes(prev => ({
            ...prev,
            enrichmentStatus,
            enrichedData: { ...prev.enrichedData, ...data }
          }));
        }
      };

      await generateNotes(
        repoOwner,
        repoName,
        selectedPR.number,
        selectedPR.title,
        selectedPR.diff_content || '',
        selectedPR.diff_content || '',
        handleStreamUpdate
      );

      const finalDeveloper = notes.developer + (developerBuffer || "");
      const finalMarketing = notes.marketing + (marketingBuffer || "");

      persistedNotesRef.current = { ...persistedNotesRef.current, developer: finalDeveloper, marketing: finalMarketing };

      setNotes(prev => ({
        ...prev,
        developer: finalDeveloper,
        marketing: finalMarketing
      }));

      cachedNotesRef.current = {
        developer: finalDeveloper,
        marketing: finalMarketing
      };

      setTimeout(() => {
        setNotes(current => {
          if (!current.developer?.trim()) {
            return {
              ...current,
              developer: persistedNotesRef.current.developer,
              marketing: persistedNotesRef.current.marketing
            };
          }
          return current;
        });
      }, 100);

      setDeveloperBuffer("");
      setMarketingBuffer("");
      setIsGeneratingNotes(false);

      toast({
        title: "Notes Generated!",
        description: "The AI-powered notes for this PR have been generated.",
      });
    } catch (error) {
      setIsGeneratingNotes(false);
      const msg = error instanceof Error ? error.message : "Failed to generate notes";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: msg,
      });
    }
  };

  if (!selectedPR) return null;

  return (
    <div ref={notesRef} className="mt-8">
      {/* UI rendering continues as-is... */}
      {/* You can include your existing JSX below this line */}
    </div>
  );
}
