// Copy to src/app/components/ui/badge.tsx
"use client";

import * as React from "react";
import { cn } from "../../../lib/utils"; // Adjust the import path

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "accent" | "secondary"; // Added 'accent' and 'secondary'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"; // Use rounded-full

    const variantStyles = {
      // Default subtle grey badge
      default: "bg-gray-100 text-gray-800 border-transparent dark:bg-gray-700 dark:text-gray-200",
      // Outline badge
      outline: "text-gray-700 border border-gray-300 dark:text-gray-300 dark:border-gray-600",
      // Accent yellow badge (like PR number)
      accent: "bg-yellow-400 text-gray-900 border-transparent dark:bg-yellow-500 dark:text-black",
      // Optional: Secondary badge (e.g., for file counts, commits)
      secondary: "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-900 dark:text-blue-200", // Example secondary color
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";