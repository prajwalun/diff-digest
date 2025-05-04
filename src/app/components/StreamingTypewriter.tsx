"use client";

import { useState, useEffect, useRef } from "react";

interface StreamingTypewriterProps {
  fullText: string;
  speed?: number; // ms per character
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

    const chars = Array.from(fullText); // Unicode-safe

    const stream = () => {
      if (charIndex.current >= chars.length) {
        setFinished(true);
        onComplete?.();
        return;
      }

      const nextChar = chars[charIndex.current];
      setDisplayed(chars.slice(0, charIndex.current + 1).join(""));
      charIndex.current += 1;

      let delay = speed;
      if (pauseAfterPunctuation && /[.,!?;\n]/.test(nextChar)) {
        delay += 100;
      }

      timeout.current = setTimeout(stream, delay);
    };

    timeout.current = setTimeout(stream, speed);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [fullText, speed, pauseAfterPunctuation, onComplete]);

  return (
    <span className="inline whitespace-pre-wrap break-words font-mono leading-relaxed">
      {displayed}
      {!finished && showCursor && (
        <span
          aria-hidden="true"
          className="animate-pulse ml-0.5 text-muted-foreground"
        >
          |
        </span>
      )}
    </span>
  );
}
