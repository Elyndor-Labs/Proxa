"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchFixtureMarkets } from "@/lib/api/markets";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches all markets for a single fixture ID. */
export function useFixtureMarkets(fixtureId: string) {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.fixtureMarkets(fixtureId),
    queryFn: async () => {
      const records = await fetchFixtureMarkets(fixtureId, client);
      return records
        .map((record) => ({ record, view: toMarketView(record.account) }))
        .sort((a, b) => Number(a.view.id) - Number(b.view.id));
    },
    enabled: Boolean(fixtureId),
  });
}
