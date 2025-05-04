
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../../lib/utils";

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
      "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-background data-[state=active]:text-foreground",
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
    className={cn("mt-2 rounded-md border border-muted p-4", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

// Export all together
export { Tabs, TabsList, TabsTrigger, TabsContent };
