"use client";

import { BN } from "@coral-xyz/anchor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";

interface UseMarketOptions {
  /** Subscribe to on-chain account changes for live pool updates. */
  subscribe?: boolean;
}

/** Fetches a single market by ID with optional live subscription. */
export function useMarket(marketId: string, options: UseMarketOptions = {}) {
  const { client } = useProxaClient();
  const queryClient = useQueryClient();
  const { subscribe = false } = options;

  const query = useQuery({
    queryKey: queryKeys.market(marketId),
    queryFn: async () => {
      const account = await client.fetchMarket(new BN(marketId));
      return { account, view: toMarketView(account) };
    },
    enabled: Boolean(marketId),
  });

  useEffect(() => {
    if (!subscribe || !marketId) return;

    const listener = client.onMarketChange(new BN(marketId), () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
    });

    return () => {
      void client.removeListener(listener);
    };
  }, [client, marketId, subscribe, queryClient]);

  return query;
}
