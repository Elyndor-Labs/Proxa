"use client";

import { useMemo } from "react";
import { useMarkets } from "@/hooks/use-markets";
import { synthesizeActivityFeed } from "@/lib/activity/synthesize-feed";

/** Platform activity items derived from live market data. */
export function useActivityFeed() {
  const { data } = useMarkets();

  return useMemo(
    () => synthesizeActivityFeed(data ?? [], 20),
    [data],
  );
}
