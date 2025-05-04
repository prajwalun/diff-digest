// components/StreamingTypewriter.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // Assuming framer-motion installed

interface StreamingTypewriterProps {
  fullText: string;
  speed?: number;
  pauseAfterPunctuation?: boolean;
  showCursor?: boolean;
  onComplete?: () => void;
}

// Removed default export for consistency, will use named export
export function StreamingTypewriter({
  fullText,
  speed = 15,
  pauseAfterPunctuation = true,
  showCursor = true,
  onComplete,
}: StreamingTypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [finished, setFinished] = useState(false);
  const charIndex = useRef(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayed("");
    setFinished(false);
    charIndex.current = 0;

    const chars = Array.from(fullText);

    const stream = () => {
      if (charIndex.current >= chars.length) {
        setFinished(true);
        onComplete?.();
        return;
      }

      const nextChar = chars[charIndex.current];
      setDisplayed((prev) => prev + nextChar);
      charIndex.current += 1;

      // Adjust pause logic based on character
      const punctuationPause = pauseAfterPunctuation && /[.,!?;:\n\r]/.test(nextChar); // Added colon and carriage return
      const delay = punctuationPause ? speed + 100 : speed; // Keep pause duration

      timeout.current = setTimeout(stream, delay);
    };

    // Initial delay before streaming starts (optional, but can make it feel more natural)
    // const initialDelay = 50; // milliseconds
    // timeout.current = setTimeout(stream, initialDelay);

    // Start streaming immediately or with a small delay
     timeout.current = setTimeout(stream, speed);


    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [fullText, speed, pauseAfterPunctuation, onComplete]);


  // Add a key to the container div so Framer Motion knows it's a new element when fullText changes
  // This ensures the initial animation runs when the streaming starts for a new PR
  return (
    <motion.div
      key={fullText} // Added key based on fullText
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // REMOVED container styling (background, border, padding, rounded corners)
      // Added text styling to match the main notes content
      className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans" // Use sans font, match text color, match leading
    >
      {displayed}
      {/* Cursor Styling - Refined Color and Animation */}
      {!finished && showCursor && (
        <motion.span
          key="cursor" // Key for cursor animation
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          className="text-yellow-500 dark:text-yellow-400 ml-0.5 inline-block" // Use accent yellow, ensure inline-block for ml
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
}