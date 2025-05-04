import * as React from "react";
import { cn } from "@/lib/utils"; 

// Card wrapper component
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-white text-gray-900 shadow-md transition-colors duration-200",
        "dark:bg-gray-800 dark:text-white dark:shadow-lg dark:border-gray-700 border-gray-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Card content container component
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";
