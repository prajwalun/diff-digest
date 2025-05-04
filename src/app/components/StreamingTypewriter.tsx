"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StreamingTypewriterProps {
  fullText: string;
  speed?: number;
  pauseAfterPunctuation?: boolean;
  showCursor?: boolean;
  onComplete?: () => void;
}

export default function StreamingTypewriter({
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

      const punctuationPause = pauseAfterPunctuation && /[.,!?;\n]/.test(nextChar);
      const delay = punctuationPause ? speed + 100 : speed;

      timeout.current = setTimeout(stream, delay);
    };

    timeout.current = setTimeout(stream, speed);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [fullText, speed, pauseAfterPunctuation, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-muted dark:bg-gray-900/50 border border-muted-foreground/10 rounded-xl p-4 text-sm font-mono text-foreground dark:text-white whitespace-pre-wrap"
    >
      {displayed}
      {!finished && showCursor && (
        <span className="animate-pulse text-primary ml-0.5">|</span>
      )}
    </motion.div>
  );
}
