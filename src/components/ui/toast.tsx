"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Toast = { id: string; title?: string; message: string; variant?: "success" | "error" | "info" | "warning" };

type ToastContextType = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-6 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto min-w-[280px] max-w-md rounded-lg border px-4 py-3 shadow-lg",
              t.variant === "success" && "border-watc-success bg-green-50 text-green-900",
              t.variant === "error" && "border-watc-error bg-red-50 text-red-900",
              t.variant === "warning" && "border-watc-warning bg-orange-50 text-orange-900",
              (!t.variant || t.variant === "info") && "border-watc-accent bg-blue-50 text-blue-900"
            )}
          >
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}
