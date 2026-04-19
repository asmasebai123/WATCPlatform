"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function Checkbox({ checked, onCheckedChange, label, className, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("inline-flex cursor-pointer items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background transition-colors",
          checked && "bg-watc-primary border-watc-primary text-white"
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </span>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={!!checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
