"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  emphasized?: boolean;
  className?: string;
  label?: string;
}

/** Copy-to-clipboard with icon morph to checkmark (~1.5s). */
export function CopyButton({ text, emphasized, className, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimeoutRef.current = null;
      }, 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={copied ? "Copied" : label}
      className={cn("copy-btn", emphasized && "copy-btn--emphasized", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            className="copy-btn__icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="copy-btn__icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
