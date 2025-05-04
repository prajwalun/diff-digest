
import * as React from "react";
import { cn } from "../../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          variant === "default" &&
            "bg-primary text-primary-foreground border-transparent",
          variant === "outline" &&
            "text-foreground border border-border",
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
