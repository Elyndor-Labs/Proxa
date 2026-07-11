"use client";

import { useSyncExternalStore } from "react";
import { formatTimeRemaining } from "@/lib/format/time";

function subscribeMinuteTick(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(id);
}

function getMinuteTick() {
  return Math.floor(Date.now() / 60_000);
}

/** Live-updating relative countdown label (refreshes every minute). */
export function useTimeRemaining(targetMs: number): string {
  const minute = useSyncExternalStore(subscribeMinuteTick, getMinuteTick, () => 0);
  void minute;
  return formatTimeRemaining(targetMs);
}
