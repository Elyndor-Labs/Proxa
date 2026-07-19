"use client";

import { useSyncExternalStore } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/format/countdown";

const SSR_PLACEHOLDER: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  closed: false,
};

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
  if (second === 0) return SSR_PLACEHOLDER;
  return getCountdownParts(targetMs, second * 1000);
}
