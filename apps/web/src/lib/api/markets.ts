import { BN } from "@coral-xyz/anchor";
import type { MarketRecord } from "@proxa/sdk";
import type { ProxaClient } from "@proxa/sdk";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { deserializeMarketAccount, deserializeMarketRecord } from "@/lib/api/deserialize";
import {
  wireMarketRecordListSchema,
  wireMarketResponseSchema,
  wireMarketsListResponseSchema,
} from "@/lib/api/schemas";
import { z } from "zod";

const wireMarketsListOrArraySchema = z.union([
  wireMarketsListResponseSchema,
  wireMarketRecordListSchema,
]);

/** GET /markets/:id */
export async function fetchMarketFromApi(marketId: string, client: ProxaClient): Promise<MarketRecord> {
  const data = await apiParse(`/markets/${marketId}`, wireMarketResponseSchema);

  if ("account" in data) {
    return deserializeMarketRecord(data);
  }

  return {
    address: client.marketPda(new BN(marketId)),
    account: deserializeMarketAccount(data),
  };
}

/** GET /markets/fixture/:fixtureId */
export async function fetchMarketsByFixtureFromApi(fixtureId: string): Promise<MarketRecord[]> {
  const data = await apiParse(`/markets/fixture/${fixtureId}`, wireMarketRecordListSchema);
  return data.map(deserializeMarketRecord);
}

export interface FetchAllMarketsParams {
  status?: string;
  fixtureId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

/** GET /markets */
export async function fetchAllMarketsFromApi(
  params: FetchAllMarketsParams = {},
): Promise<MarketRecord[]> {
  const limit = params.limit ?? 50;
  const all: MarketRecord[] = [];
  let page = params.page ?? 1;

  while (true) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.fixtureId) search.set("fixtureId", params.fixtureId);
    if (params.q) search.set("q", params.q);
    search.set("page", String(page));
    search.set("limit", String(limit));

    const path = `/markets?${search.toString()}`;
    const data = await apiParse(path, wireMarketsListOrArraySchema);
    const items = Array.isArray(data) ? data : data.items;
    all.push(...items.map(deserializeMarketRecord));

    if (Array.isArray(data) || items.length < limit || all.length >= data.total) {
      break;
    }
    page += 1;
  }

  return all;
}

/** Fetch fixture markets from the API when configured, otherwise from chain. */
export async function fetchFixtureMarkets(fixtureId: string, client: ProxaClient): Promise<MarketRecord[]> {
  if (isApiEnabled()) {
    return fetchMarketsByFixtureFromApi(fixtureId);
  }
  return client.fetchMarketsByFixture(new BN(fixtureId));
}

/** Fetch all markets from the API when configured, otherwise from chain. */
export async function fetchAllMarkets(
  client: ProxaClient,
  params: FetchAllMarketsParams = {},
): Promise<MarketRecord[]> {
  if (isApiEnabled()) {
    return fetchAllMarketsFromApi(params);
  }
  return client.fetchAllMarkets();
}

/** Fetch a single market record from the API when configured, otherwise from chain. */
export async function fetchMarketRecord(marketId: string, client: ProxaClient): Promise<MarketRecord> {
  if (isApiEnabled()) {
    return fetchMarketFromApi(marketId, client);
  }

  const account = await client.fetchMarket(new BN(marketId));
  return {
    address: client.marketPda(new BN(marketId)),
    account,
  };
}
