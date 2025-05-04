"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-full p-2 transition-all duration-300 group hover:bg-accent/20"
    >
      <Sun
        className="h-5 w-5 text-primary transition-transform duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
      />
      <Moon
        className="absolute h-5 w-5 text-yellow-400 transition-transform duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
