"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchAllMarkets } from "@/lib/api/markets";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";

interface UseMarketsOptions {
  enabled?: boolean;
}

/** Fetches all markets and maps them to UI views. */
export function useMarkets(options: UseMarketsOptions = {}) {
  const { enabled = true } = options;
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.markets,
    enabled,
    queryFn: async () => {
      const records = await fetchAllMarkets(client);
      return records
        .map((record) => ({ record, view: toMarketView(record.account) }))
        .sort((a, b) => Number(b.view.id) - Number(a.view.id));
    },
  });
}
