"use client";

import { useQuery } from "@tanstack/react-query";
import { quoteClaim } from "@proxa/sdk";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchMarketRecord } from "@/lib/api/markets";
import { fetchPositions } from "@/lib/api/positions";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";
import type { PositionRecord } from "@proxa/sdk";

export interface EnrichedPosition {
  position: PositionRecord;
  market: Awaited<ReturnType<typeof fetchMarketRecord>>["account"];
  marketId: string;
  claimable: ReturnType<typeof quoteClaim>;
  view: ReturnType<typeof toMarketView>;
}

/** Positions enriched with market data under a single cache key. */
export function useEnrichedPositions() {
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.positionsEnriched(owner ?? ""),
    enabled: Boolean(owner),
    queryFn: async (): Promise<EnrichedPosition[]> => {
      if (!wallet?.publicKey) return [];

      const positions = await fetchPositions(wallet.publicKey, client);
      if (!positions.length) return [];

      const marketIds = [...new Set(positions.map((p) => p.account.marketId.toString()))];
      const marketRecords = await Promise.all(
        marketIds.map((marketId) => fetchMarketRecord(marketId, client)),
      );
      const marketById = new Map(marketIds.map((id, index) => [id, marketRecords[index]!]));

      return positions.map((position) => {
        const marketId = position.account.marketId.toString();
        const record = marketById.get(marketId)!;
        const market = record.account;
        return {
          position,
          market,
          marketId,
          claimable: quoteClaim(market, position.account),
          view: toMarketView(market),
        };
      });
    },
  });
}
