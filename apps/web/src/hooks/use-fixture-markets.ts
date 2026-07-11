"use client";

import { BN } from "@coral-xyz/anchor";
import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { toMarketView } from "@/lib/proxa/market-view";

/** Fetches all markets for a single fixture ID. */
export function useFixtureMarkets(fixtureId: string) {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: ["fixtures", fixtureId],
    queryFn: async () => {
      const records = await client.fetchMarketsByFixture(new BN(fixtureId));
      return records
        .map((record) => ({ record, view: toMarketView(record.account) }))
        .sort((a, b) => Number(a.view.id) - Number(b.view.id));
    },
    enabled: Boolean(fixtureId),
  });
}
