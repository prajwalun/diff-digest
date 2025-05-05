
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, Clipboard, FileCode, FileText, TerminalSquare, 
  Megaphone, Check, AlertCircle, Loader2, LightbulbIcon,
  Sparkles, PenTool, Zap, Code, Terminal, BookOpenCheck
} from "lucide-react"
import { toast } from "sonner" // Use sonner directly
import { Button } from "./ui/button"
import { StreamingTypewriter } from "./StreamingTypewriter"
import { GeneratedNotes as NotesType } from "../../lib/types" // Adjust the import path

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

// Markdown to HTML conversion helper
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-5 mb-2 text-gray-800 dark:text-gray-100">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-800 dark:text-gray-200">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.*$)/gim, '<div class="flex items-start space-x-2 mt-1.5 mb-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 flex-shrink-0"></div><div class="flex-1 text-gray-700 dark:text-gray-300">$1</div></div>')
    .replace(/\n\n/gim, '<div class="my-4"></div>')
    .replace(/\n/gim, '<br />');
}

interface GeneratedNotesProps {
  notes: NotesType | null
  isGenerating: boolean
}

// Add forwardRef to enable scrolling to this component
export const GeneratedNotes = React.forwardRef<HTMLDivElement, GeneratedNotesProps>(
  ({ notes, isGenerating }, ref) => {
    const [activeTab, setActiveTab] = React.useState('dev')
    const [copied, setCopied] = React.useState(false)
    const [showTypewriter, setShowTypewriter] = React.useState(true)
    
    // Reset typewriter when notes change
    React.useEffect(() => {
      if (notes) {
        setShowTypewriter(true);
      }
    }, [notes]);
    
    const handleTypewriterComplete = () => {
      setShowTypewriter(false);
    };
    
    const handleDownload = () => {
      if (!notes) return
      
      // Create more professional filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `release-notes-pr-${notes.prNumber}-${date}.md`;
      
      const content = `# Developer Notes for PR #${notes.prNumber}: ${notes.prTitle}\n\n${notes.developerNotes}\n\n# Marketing Notes\n\n${notes.marketingNotes}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const href = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      
      // Enhanced toast message
      toast.success("Notes downloaded", {
        description: `Saved as ${filename}`,
        duration: 3000
      });
    };

    const handleCopy = async () => {
      if (!notes) return
      
      try {
        const content = activeTab === 'dev' ? notes.developerNotes : notes.marketingNotes
        await navigator.clipboard.writeText(content.replace(/<[^>]*>/g, ''))
        setCopied(true)
        
        // Enhanced toast message
        toast.success("Copied to clipboard", {
          description: `${activeTab === 'dev' ? 'Developer' : 'Marketing'} notes copied successfully.`,
          duration: 2000
        });
        
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Failed to copy", {
          description: "Please try again or copy the text manually."
        });
      }
    }

    const renderNotesContent = () => {
      if (isGenerating) {
        return (
          <div className="flex flex-col items-center justify-center py-12 border border-gray-200/80 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-blue-100/50 dark:bg-blue-900/30 blur-md"></div>
              <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin relative" />
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex gap-2 items-center">
                <span>Generating comprehensive release notes</span>
                <span className="inline-flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></span>
                  <span className="h-1.5 w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse delay-150"></span>
                  <span className="h-1.5 w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse delay-300"></span>
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              This may take a few moments
            </div>
          </div>
        )
      }

      if (!notes) {
        return (
          <div className="flex flex-col items-center justify-center py-16 border border-gray-200/80 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gray-100/50 dark:bg-gray-700/30 blur-md"></div>
              <FileText className="h-12 w-12 text-gray-500 dark:text-gray-400 relative" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">
              No Notes Generated Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 leading-relaxed">
              Select a Pull Request from the list above and click "Generate Notes" to create 
              comprehensive, AI-powered release notes for developers and marketing teams.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 text-xs rounded-full px-3 py-1.5 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-600/30 shadow-sm">
              <LightbulbIcon className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>Intelligent PR analysis awaits</span>
            </div>
          </div>
        )
      }

      const noteContent = activeTab === 'dev' ? notes.developerNotes : notes.marketingNotes;
      const Icon = activeTab === 'dev' ? Code : Sparkles;
      const bgClass = activeTab === 'dev' 
        ? 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-100/60 dark:border-blue-900/30' 
        : 'bg-purple-50/20 dark:bg-purple-900/10 border-purple-100/60 dark:border-purple-900/30';
      const iconBgClass = activeTab === 'dev'
        ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        : 'bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';

      return (
        <div className={`border border-gray-200/80 dark:border-gray-700/50 rounded-lg overflow-hidden shadow-sm ${bgClass}`}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200/80 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {activeTab === 'dev' ? 'Technical Details' : 'Feature Highlights'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={`h-8 text-xs shadow-sm ${
                  copied 
                    ? 'border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 bg-green-50/70 dark:bg-green-900/20' 
                    : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50'
                } transition-all duration-200`}
              >
                {copied ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    <span>Copied</span>
                  </motion.div>
                ) : (
                  <>
                    <Clipboard className="h-3.5 w-3.5 mr-1.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="p-6 bg-white/90 dark:bg-gray-800/90">
            {showTypewriter ? (
              <StreamingTypewriter 
                text={noteContent} 
                onComplete={handleTypewriterComplete}
                speed={5}
                delay={300}
                className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="prose prose-gray dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(noteContent) }}
              />
            )}
          </div>
        </div>
      )
    }

    return (
      <motion.section 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 25 }}
        className="mt-8 container max-w-4xl mx-auto"
      >
        <div className="glass-card rounded-xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-700/50">
          {/* Header with gradient accent */}
          <div className="relative">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 dark:from-blue-600 dark:via-blue-500 dark:to-blue-700"></div>
            
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl gradient-blue-bg text-white shadow-md">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {notes ? `PR #${notes.prNumber} Notes` : 'Release Notes'}
                  </h2>
                  {notes && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 font-medium truncate max-w-[300px] sm:max-w-md">
                      {notes.prTitle}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Generated timestamp with enhanced styling */}
              {notes && (
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600/50 shadow-sm">
                  <BookOpenCheck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {notes.generatedAt ? formatDate(notes.generatedAt) : 'Just now'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced tab navigation with floating effect */}
          <div className="border-b border-gray-200/80 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex px-1">
              <button
                className={`px-5 py-3.5 text-sm font-medium relative transition-all duration-200 rounded-t-lg mx-1 mt-1 ${
                  activeTab === 'dev'
                    ? 'text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200/80 dark:border-gray-700/50 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/40'
                }`}
                onClick={() => setActiveTab('dev')}
                aria-current={activeTab === 'dev' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>Developer</span>
                </div>
              </button>
              
              <button
                className={`px-5 py-3.5 text-sm font-medium relative transition-all duration-200 rounded-t-lg mx-1 mt-1 ${
                  activeTab === 'marketing'
                    ? 'text-purple-700 dark:text-purple-400 bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200/80 dark:border-gray-700/50 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/40'
                }`}
                onClick={() => setActiveTab('marketing')}
                aria-current={activeTab === 'marketing' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <span>Marketing</span>
                </div>
              </button>
            </div>
          </div>

          {/* Notes content with improved animation */}
          <div className="p-6 bg-white/95 dark:bg-gray-800/95">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {renderNotesContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced action buttons */}
          {notes && (
            <div className="border-t border-gray-200/80 dark:border-gray-700/50 p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  <span>AI-powered analysis</span>
                </span>
              </div>
              
              <div className="flex gap-3 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 shadow-sm"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  <span>Download Notes</span>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced information notice */}
        {notes && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 p-4 rounded-lg glass-card border-blue-200/50 dark:border-blue-800/30 flex gap-3 items-center shadow-sm"
          >
            <div className="flex-shrink-0 p-1.5 bg-blue-100/80 dark:bg-blue-800/30 rounded-full">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              These notes are AI-generated and may require review before publishing to ensure accuracy.
            </div>
          </motion.div>
        )}
      </motion.section>
    )
  }
)

GeneratedNotes.displayName = "GeneratedNotes"