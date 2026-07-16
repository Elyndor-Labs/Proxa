"use client";

import { useQuery } from "@tanstack/react-query";
import { quoteClaim } from "@proxa/sdk";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchFixtureDetail } from "@/lib/api/fixtures";
import { fetchMarketRecord } from "@/lib/api/markets";
import { applyFixtureMarketMetadata } from "@/lib/proxa/market-metadata";
import { fetchPositions } from "@/lib/api/positions";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";
import type { PositionRecord } from "@proxa/sdk";
import type { MarketRecord } from "@proxa/sdk";

export interface EnrichedPosition {
  position: PositionRecord;
  market: Awaited<ReturnType<typeof fetchMarketRecord>>["account"];
  marketId: string;
  claimable: ReturnType<typeof quoteClaim>;
  view: ReturnType<typeof toMarketView>;
}

async function fetchMarketRecordsById(
  marketIds: string[],
  client: ReturnType<typeof useProxaClient>["client"],
) {
  const results = await Promise.allSettled(
    marketIds.map((marketId) => fetchMarketRecord(marketId, client)),
  );
  const marketById = new Map<string, MarketRecord>();

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      marketById.set(marketIds[index]!, result.value);
    }
  });

  return marketById;
}

function enrichPositions(
  positions: PositionRecord[],
  marketById: Map<string, MarketRecord>,
  fixtureById = new Map<string, Awaited<ReturnType<typeof fetchFixtureDetail>> | undefined>(),
): EnrichedPosition[] {
  return positions.flatMap((position) => {
    const marketId = position.account.marketId.toString();
    const record = marketById.get(marketId);
    if (!record) return [];

    const market = record.account;
    const view = toMarketView(market);
    return {
      position,
      market,
      marketId,
      claimable: quoteClaim(market, position.account),
      view: applyFixtureMarketMetadata(view, fixtureById.get(view.fixtureId)),
    };
  });
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
      const marketById = await fetchMarketRecordsById(marketIds, client);
      const marketRecords = [...marketById.values()];
      const fixtureIds = [...new Set(marketRecords.map((record) => record.account.fixtureId.toString()))];
      const fixtures = await Promise.all(
        fixtureIds.map((fixtureId) => fetchFixtureDetail(fixtureId).catch(() => undefined)),
      );
      const fixtureById = new Map(fixtureIds.map((id, index) => [id, fixtures[index]]));

      return enrichPositions(positions, marketById, fixtureById);
    },
  });
}

/** Enriches only the visible page to avoid large bursts of market fetches. */
export function usePagedEnrichedPositions(
  page: number,
  pageSize: number,
  options: { enabled?: boolean } = {},
) {
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();
  const { client } = useProxaClient();
  const enabled = options.enabled ?? true;

  return useQuery({
    queryKey: [...queryKeys.positionsEnriched(owner ?? ""), "page", page, pageSize],
    enabled: Boolean(owner) && enabled,
    queryFn: async (): Promise<{
      items: EnrichedPosition[];
      total: number;
      trades: number;
      markets: number;
      tokensStaked: number;
    }> => {
      if (!wallet?.publicKey) {
        return { items: [], total: 0, trades: 0, markets: 0, tokensStaked: 0 };
      }

      const positions = await fetchPositions(wallet.publicKey, client);
      const total = positions.length;
      const pagePositions = positions.slice(page * pageSize, page * pageSize + pageSize);
      const marketIds = [...new Set(pagePositions.map((p) => p.account.marketId.toString()))];
      const marketById = await fetchMarketRecordsById(marketIds, client);
      const marketRecords = [...marketById.values()];

      const fixtureIds = [...new Set(marketRecords.map((record) => record.account.fixtureId.toString()))];
      const fixtures = await Promise.all(
        fixtureIds.map((fixtureId) => fetchFixtureDetail(fixtureId).catch(() => undefined)),
      );
      const fixtureById = new Map(fixtureIds.map((id, index) => [id, fixtures[index]]));

      return {
        items: enrichPositions(pagePositions, marketById, fixtureById),
        total,
        trades: total,
        markets: new Set(positions.map((position) => position.account.marketId.toString())).size,
        tokensStaked: positions.reduce(
          (sum, position) => sum + Number(position.account.amount.toString()) / 1_000_000,
          0,
        ),
      };
    },
  });
}
