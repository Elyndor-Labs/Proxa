"use client";

import { useSyncExternalStore } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/format/countdown";

function subscribeSecondTick(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getSecondTick() {
  return Math.floor(Date.now() / 1000);
}

/** Live countdown parts — updates every second. */
export function useCountdownParts(targetMs: number): CountdownParts {
  const second = useSyncExternalStore(subscribeSecondTick, getSecondTick, () => 0);
  void second;
  return getCountdownParts(targetMs);
}
