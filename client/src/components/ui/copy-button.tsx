"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react"; 
import { Check, Copy } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { cn } from "@/lib/utils"; 

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Use useEffect to manage the timer, resetting if text or component changes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000); // Show "Copied!" for 2 seconds
    }
    return () => clearTimeout(timer); // Clean up timer on unmount or if copied state changes
  }, [copied]); // Depend on the 'copied' state

  const handleCopy = async () => {
    if (!text) return; // Prevent copying if text is empty
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700",
        "dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200",
        "transition-all duration-150",
        copied ? "text-green-600 dark:text-green-400 hover:!bg-transparent hover:!text-green-600 dark:hover:!text-green-400" : "",
        className
      )}
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      disabled={!text}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
