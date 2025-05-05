"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StreamingTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function StreamingTypewriter({
  text,
  speed = 20,
  delay = 0,
  onComplete,
  className = "",
}: StreamingTypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Reset state when text changes
    setDisplayText("");
    setIsComplete(false);
    setIsTyping(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Delay before starting the typing animation
    timeoutRef.current = setTimeout(() => {
      setIsTyping(true);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay]);
  
  useEffect(() => {
    if (!isTyping || isComplete) return;
    
    let currentIndex = 0;
    const textLength = text.length;
    
    // Function to add the next character
    const typeNextChar = () => {
      if (currentIndex < textLength) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    };
    
    // Start the typing animation
    timeoutRef.current = setTimeout(typeNextChar, speed);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, isComplete, text, speed, onComplete]);
  
  // Split text by line breaks to animate line by line
  const lines = displayText.split('\n');
  
  return (
    <div className={className}>
      {lines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="whitespace-pre-wrap"
        >
          {line || ' '} {/* Ensure empty lines render with space */}
        </motion.div>
      ))}
      
      {/* Cursor that blinks while typing */}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 ml-1 bg-blue-500 dark:bg-blue-400"
        />
      )}
    </div>
  );
}