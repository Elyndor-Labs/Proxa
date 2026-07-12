"use client";

import { isApiEnabled } from "@/config/api";

/** Warns when market/position reads use the mock API but transactions still hit chain. */
export function ApiModeBanner() {
  if (!isApiEnabled()) return null;

  return (
    <div
      role="status"
      className="border-b border-brand/30 bg-brand/10 px-4 py-2 text-center font-label text-xs text-foreground sm:text-sm"
    >
      API mode: market data is served from the REST API. Bets and claims are disabled — mock markets are not on-chain.
    </div>
  );
}
