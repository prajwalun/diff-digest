"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StreamingTypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  startDelay?: number;
  onComplete?: () => void;
  formatMarkdown?: boolean;
}

/**
 * StreamingTypewriter component for animated text display
 * This creates a typewriter effect for streaming in text content
 */
export function StreamingTypewriter({
  text,
  speed = 25,
  className = "",
  startDelay = 500,
  onComplete,
  formatMarkdown = false
}: StreamingTypewriterProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const charIndexRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format markdown with simple regex or handle pre-formatted HTML
  const formatText = (text: string) => {
    if (!formatMarkdown) return text;
    
    // Check if the text already contains HTML tags (potentially from streaming API)
    if (text.includes('<h') || text.includes('<p') || text.includes('<ul') || text.includes('<li')) {
      // If content is already HTML (from streaming API), return it as-is with some basic styling
      return text
        // Improve heading styles
        .replace(/<h1/g, '<h1 class="text-2xl font-bold mt-6 mb-4"')
        .replace(/<h2/g, '<h2 class="text-xl font-bold mt-5 mb-3"')
        .replace(/<h3/g, '<h3 class="text-lg font-bold mt-4 mb-2"')
        .replace(/<h4/g, '<h4 class="text-lg font-semibold mt-4 mb-2"')
        // Improve paragraph styles
        .replace(/<p/g, '<p class="mb-3"')
        // Improve list styles
        .replace(/<ul/g, '<ul class="ml-5 mb-4 list-disc space-y-1"')
        .replace(/<ol/g, '<ol class="ml-5 mb-4 list-decimal space-y-1"')
        .replace(/<li/g, '<li class="ml-2"')
        // Improve code styles
        .replace(/<code/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-sm"');
    }
    
    // If content is markdown, parse it to HTML
    return text
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 flex items-start"><span class="mr-2 text-blue-500">•</span>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  useEffect(() => {
    setDisplayedText("");
    charIndexRef.current = 0;
    setIsComplete(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Start typing after a delay
    const initialDelay = setTimeout(() => {
      typeNextCharacter();
    }, startDelay);
    
    return () => {
      clearTimeout(initialDelay);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, startDelay]);
  
  // Function to type the next character
  const typeNextCharacter = () => {
    if (charIndexRef.current < text.length) {
      const nextChar = text[charIndexRef.current];
      setDisplayedText((prev) => prev + nextChar);
      charIndexRef.current += 1;
      
      // Calculate delay based on punctuation for more natural typing
      let delay = speed;
      if (['.', '!', '?', '\n'].includes(nextChar)) {
        delay = speed * 6; // Longer pause after sentences
      } else if ([',', ';', ':'].includes(nextChar)) {
        delay = speed * 3; // Medium pause after commas and semicolons
      }
      
      // Set timeout for next character
      timeoutRef.current = setTimeout(typeNextCharacter, delay);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  const formattedText = formatMarkdown 
    ? { __html: formatText(displayedText) } 
    : undefined;
  
  return (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {formatMarkdown ? (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={formattedText}
        />
      ) : (
        displayedText
      )}
      
      {/* Blinking cursor that stops when typing is complete */}
      {!isComplete && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 dark:bg-blue-400 align-middle"
        />
      )}
    </motion.div>
  );
}