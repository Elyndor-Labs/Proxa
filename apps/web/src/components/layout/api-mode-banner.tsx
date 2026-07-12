"use client";

import { isApiEnabled } from "@/config/api";

/** Warns when market/position reads use the REST API instead of direct RPC. */
export function ApiModeBanner() {
  if (!isApiEnabled()) return null;

  return (
    <div
      role="status"
      className="animate-slide-down border-b border-brand/20 bg-brand/5 px-4 py-1.5 text-center font-label text-xs text-muted-foreground"
    >
      API mode: live market data from backend · on-chain bets and claims disabled
    </div>
  );
}
