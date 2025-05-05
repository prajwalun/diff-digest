"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-9 h-9 rounded-full opacity-70"
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        <Sun 
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          }`} 
        />
        <Moon 
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
          }`} 
        />
        <span className="sr-only">
          {isDark ? "Switch to light theme" : "Switch to dark theme"}
        </span>
      </Button>
    </motion.div>
  );
}