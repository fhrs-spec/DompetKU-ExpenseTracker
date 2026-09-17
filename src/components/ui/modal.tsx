"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl border border-border bg-card p-4 sm:p-6 text-card-foreground shadow-2xl transition-all max-h-[92dvh] flex flex-col my-auto",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4 shrink-0 border-b border-border/40 pb-2.5 sm:pb-3">
          <div>
            <h2 id="modal-title" className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
