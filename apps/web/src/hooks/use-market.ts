"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { BN } from "@coral-xyz/anchor";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { isApiEnabled } from "@/config/api";
import { fetchMarketRecord } from "@/lib/api/markets";
import { subscribeToMarketUpdates } from "@/lib/api/websocket";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";

interface UseMarketOptions {
  /** Subscribe to live pool updates (WebSocket in API mode, on-chain in direct mode). */
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
      const record = await fetchMarketRecord(marketId, client);
      return { account: record.account, view: toMarketView(record.account) };
    },
    enabled: Boolean(marketId),
  });

  useEffect(() => {
    if (!subscribe || !marketId) return;

    if (isApiEnabled()) {
      return subscribeToMarketUpdates(marketId, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
      });
    }

    const listener = client.onMarketChange(new BN(marketId), () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.market(marketId) });
    });

    return () => {
      void client.removeListener(listener);
    };
  }, [client, marketId, subscribe, queryClient]);

  return query;
}
