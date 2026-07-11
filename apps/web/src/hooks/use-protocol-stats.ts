"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { aggregateProtocolStats } from "@/lib/proxa/stats";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches aggregated protocol statistics from all markets. */
export function useProtocolStats() {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: [...queryKeys.markets, "stats"],
    queryFn: async () => {
      const records = await client.fetchAllMarkets();
      return aggregateProtocolStats(records);
    },
  });
}

/** Fetches on-chain config (authority, fee, market count). */
export function useConfig() {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => client.fetchConfig(),
  });
}
