// Copy to src/app/components/ui/button.tsx
"use client";

import * as React from "react";
import { cn } from "../../../lib/utils"; // Adjust the import path

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Added 'accent' variant for primary actions
  variant?: "default" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg" | "icon"; // Kept existing sizes
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    // Refined base styles for all buttons
    const base =
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-200 ease-in-out \
       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-900 \
       disabled:opacity-50 disabled:pointer-events-none"; // Adjusted ring color and offset for dark mode

    const variants = {
      // Default variant: A neutral button, good for secondary actions
      default: "bg-gray-200 text-gray-800 hover:bg-gray-300 \
                dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",

      // Outline variant: Bordered button
      outline: "border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 \
                dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",

      // Ghost variant: Minimal button, good for text-based actions
      ghost: "bg-transparent hover:bg-gray-100 text-gray-800 \
              dark:hover:bg-gray-800 dark:text-gray-200",

      // Accent variant: Your prominent yellow button
      accent: "bg-yellow-500 text-gray-900 hover:bg-yellow-600 \
               dark:bg-yellow-600 dark:text-black dark:hover:bg-yellow-700 \
               focus:ring-yellow-500 dark:focus:ring-yellow-600", // Ensure accent variant has appropriate focus ring color
    };

    // Adjusted sizes slightly for better visual balance
    const sizes = {
      sm: "h-9 px-4 text-sm", // Slightly increased height and padding
      md: "h-10 px-5", // Standard size
      lg: "h-12 px-7 text-lg", // Larger size
      icon: "h-10 w-10", // Icon size matches md height/width
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";