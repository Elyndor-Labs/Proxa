"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMarkets } from "@/hooks/use-markets";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { aggregateProtocolStats } from "@/lib/proxa/stats";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Aggregated protocol stats derived from the markets list (single data source). */
export function useProtocolStats() {
  const { data: markets, isLoading, isError, error } = useMarkets();

  const stats = useMemo(
    () => (markets ? aggregateProtocolStats(markets.map((m) => m.record)) : undefined),
    [markets],
  );

  return { data: stats, isLoading, isError, error };
}

/** Fetches on-chain config (authority, fee, market count). */
export function useConfig() {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => client.fetchConfig(),
  });
}
