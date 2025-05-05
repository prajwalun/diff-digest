import * as React from "react";
import { cn } from "../../lib/utils"; 

// Card wrapper component
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-white/80 text-gray-900 shadow-md transition-colors duration-200",
        "dark:bg-gray-800/80 dark:text-white dark:shadow-lg dark:border-gray-700 border-gray-200",
        "backdrop-blur-sm glass-bottom-light",
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

// Card header component
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-b border-gray-200 dark:border-gray-700 subtle-gradient", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// Card footer component
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-t border-gray-200 dark:border-gray-700", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";