"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchFixtures } from "@/lib/api/fixtures";
import { fetchAllMarkets } from "@/lib/api/markets";
import { applyFixtureMarketMetadata, findFixtureForMarket } from "@/lib/proxa/market-metadata";
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
      const [records, fixtures] = await Promise.all([
        fetchAllMarkets(client),
        fetchFixtures().catch(() => []),
      ]);
      return records
        .map((record) => {
          const view = toMarketView(record.account);
          return {
            record,
            view: applyFixtureMarketMetadata(view, findFixtureForMarket(fixtures, view)),
          };
        })
        .sort((a, b) => Number(b.view.id) - Number(a.view.id));
    },
  });
}
