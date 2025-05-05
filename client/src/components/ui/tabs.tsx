"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// Root component
const Tabs = TabsPrimitive.Root;

// Tabs list wrapper
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start gap-4 border-b border-gray-200 dark:border-gray-700",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// Tab trigger (button-like tab)
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles: padding, font, transition, disable state
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
      "disabled:pointer-events-none disabled:opacity-50",
      // Default state: text color and hover effect
      "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
      // Focus state: outline
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
      // Active state: background, text color, and the prominent yellow underline
      "data-[state=active]:bg-transparent data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
      "data-[state=active]:relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-yellow-500 dark:data-[state=active]:after:bg-yellow-400",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// Tab content panel
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
