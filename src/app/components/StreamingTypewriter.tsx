"use client";

import { useEffect, useRef, useState } from "react";

interface StreamingTypewriterProps {
  fullText: string;
  speed?: number;
  showCursor?: boolean;
}

export default function StreamingTypewriter({ fullText, speed = 20, showCursor = true }: StreamingTypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [finished, setFinished] = useState(false);
  const charIndex = useRef(0);

  useEffect(() => {
    const chars = Array.from(fullText);
    const interval = setInterval(() => {
      if (charIndex.current >= chars.length) {
        clearInterval(interval);
        setFinished(true);
        return;
      }
      setDisplayed((prev) => prev + chars[charIndex.current]);
      charIndex.current += 1;
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, speed]);

  return (
    <span className="whitespace-pre-wrap break-words font-mono leading-relaxed text-yellow-300">
      {displayed}
      {showCursor && !finished && <span className="ml-1 animate-pulse">|</span>}
    </span>
  );
}
