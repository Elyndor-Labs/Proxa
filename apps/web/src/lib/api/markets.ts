import { BN } from "@coral-xyz/anchor";
import type { MarketAccount, MarketRecord } from "@proxa/sdk";
import type { ProxaClient } from "@proxa/sdk";
import { api, isApiEnabled } from "@/lib/api/client";
import { deserializeMarketAccount, deserializeMarketRecord } from "@/lib/api/deserialize";
import type { WireMarketAccount, WireMarketRecord } from "@/lib/api/types";

/** GET /markets/:id */
export async function fetchMarketFromApi(marketId: string, client: ProxaClient): Promise<MarketRecord> {
  const data = await api<WireMarketRecord | WireMarketAccount>(`/markets/${marketId}`);

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
  const data = await api<WireMarketRecord[]>(`/markets/fixture/${fixtureId}`);
  return data.map(deserializeMarketRecord);
}

/** Fetch a market from the API when configured, otherwise from chain. */
export async function fetchMarketAccount(marketId: string, client: ProxaClient): Promise<MarketAccount> {
  if (isApiEnabled()) {
    return (await fetchMarketFromApi(marketId, client)).account;
  }
  return client.fetchMarket(new BN(marketId));
}

/** Fetch fixture markets from the API when configured, otherwise from chain. */
export async function fetchFixtureMarkets(fixtureId: string, client: ProxaClient): Promise<MarketRecord[]> {
  if (isApiEnabled()) {
    return fetchMarketsByFixtureFromApi(fixtureId);
  }
  return client.fetchMarketsByFixture(new BN(fixtureId));
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
