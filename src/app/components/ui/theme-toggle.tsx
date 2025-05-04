"use client";

import * as React from "react";
import { useTheme } from "next-themes"; // Assuming next-themes installed
import { Moon, Sun } from "lucide-react"; // Assuming lucide-react installed
import { Button } from "./button"; // Ensure this imports your updated button component
// Assuming cn is not needed if only applying standard classes or extending button styles

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // The Button component's 'ghost' variant and 'icon' size should handle most styling
  // We'll add specific classNames here only for overrides or specific transitions
  return (
    <Button
      variant="ghost" // Use the refined ghost variant
      size="icon"   // Use the refined icon size (h-9 w-9 or h-10 w-10 based on your button.tsx)
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      // Removed custom rounded-full and hover/transition here, as Button component should handle them
      // Add className only for overrides if needed, e.g., slight size adjustment
      className="" // Apply any needed additional classes here, e.g., 'w-9 h-9' if icon size in button.tsx isn't exactly right
    >
      {/* Sun Icon (Light Mode) - Refined color */}
      <Sun
        className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" // Use standard text color
      />
      {/* Moon Icon (Dark Mode) - Keep accent color */}
      <Moon
        className="absolute h-5 w-5 text-yellow-500 dark:text-yellow-400 transition-transform duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" // Use accent yellow
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}