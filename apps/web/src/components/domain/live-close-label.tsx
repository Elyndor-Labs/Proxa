"use client";

import { useTimeRemaining } from "@/hooks/use-time-remaining";

interface LiveCloseLabelProps {
  targetMs: number;
}

/** Client-only countdown that ticks without refetching market data. */
export function LiveCloseLabel({ targetMs }: LiveCloseLabelProps) {
  return <>{useTimeRemaining(targetMs)}</>;
}
