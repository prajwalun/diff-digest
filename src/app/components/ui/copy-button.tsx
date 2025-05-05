// Copy to src/app/components/ui/copy-button.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react"; 
import { Check, Copy } from "lucide-react"; 
import { Button } from "./button"; 
import { cn } from "../../../lib/utils"; // Adjust the import path

interface CopyButtonProps {
  text: string;
  className?: string;
  // Optional: Add a size prop if you need different sizes than 'icon' default
  // size?: "sm" | "md" | "lg" | "icon";
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
      // Optional: Add a visual error indication in the UI
    }
  };

  return (
    <Button
      // Use 'ghost' variant for a minimal look
      variant="ghost"
      // Use 'icon' size for a compact button
      size="icon"
      className={cn(
        // Refined styling for a subtle button
        "h-8 w-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700", // Adjusted size, rounded corners, colors
        "dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200", // Dark mode
        "transition-all duration-150", // Smooth transition
        // Style when copied
        copied ? "text-green-600 dark:text-green-400 hover:!bg-transparent hover:!text-green-600 dark:hover:!text-green-400" : "", // Color change when copied, override hover
        className
      )}
      onClick={handleCopy}
      aria-label="Copy to clipboard" // Accessibility
      disabled={!text} // Disable if no text to copy
    >
      {/* Icon change based on copied state */}
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check" // Key for Framer Motion animation
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center" // Ensure icon is centered
          >
            <Check className="h-4 w-4" /> {/* Check icon */}
          </motion.div>
        ) : (
          <motion.div
            key="copy" // Key for Framer Motion animation
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center" // Ensure icon is centered
          >
            <Copy className="h-4 w-4" /> {/* Copy icon */}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}