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

  const apiMode = isApiEnabled();

  const query = useQuery({
    queryKey: queryKeys.market(marketId),
    queryFn: async () => {
      const record = await fetchMarketRecord(marketId, client);
      return { account: record.account, view: toMarketView(record.account) };
    },
    enabled: Boolean(marketId),
    // Poll when subscribed in API mode — WS may be unavailable behind some hosts.
    refetchInterval: subscribe && apiMode ? 8_000 : false,
  });

  useEffect(() => {
    if (!subscribe || !marketId) return;

    if (apiMode) {
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
  }, [apiMode, client, marketId, subscribe, queryClient]);

  return query;
}
