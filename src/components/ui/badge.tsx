import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-watc-primary text-white",
        secondary: "bg-watc-secondary text-white",
        success: "bg-watc-success text-white",
        warning: "bg-watc-warning text-white",
        destructive: "bg-watc-error text-white",
        outline: "border border-border text-foreground",
        ai: "bg-gradient-to-r from-watc-accent to-watc-secondary text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
