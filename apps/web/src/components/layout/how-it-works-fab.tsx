"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { HowItWorksModal } from "@/components/layout/how-it-works-modal";
import { cn } from "@/lib/utils";

interface HowItWorksFabProps {
  className?: string;
}

/** Floating trigger that opens the how-it-works onboarding modal. */
export function HowItWorksFab({ className }: HowItWorksFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2.5 font-label text-sm shadow-lg backdrop-blur-sm transition-all hover:border-brand/30 hover:bg-muted hover:shadow-brand/10",
          className,
        )}
      >
        <Info className="h-4 w-4 text-brand" />
        How it works
      </button>
      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
