"use client";

import { Clock } from "lucide-react";
import { SegmentedCountdown } from "@/components/domain/segmented-countdown";
import { useTimeRemaining } from "@/hooks/use-time-remaining";
import { cn } from "@/lib/utils";

interface LiveCloseLabelProps {
  targetMs: number;
  className?: string;
  variant?: "tag" | "segmented";
  compact?: boolean;
}

/** Live close countdown — tag or segmented digit boxes. */
export function LiveCloseLabel({
  targetMs,
  className,
  variant = "tag",
  compact,
}: LiveCloseLabelProps) {
  const label = useTimeRemaining(targetMs);
  const isClosed = label === "Closed";

  if (variant === "segmented") {
    return (
      <SegmentedCountdown
        targetMs={targetMs}
        className={className}
        compact={compact}
      />
    );
  }

  return (
    <span className={cn("countdown-tag", isClosed && "countdown-tag--closed", className)}>
      <Clock className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      {isClosed ? "Closed" : `closes in ${label}`}
    </span>
  );
}
