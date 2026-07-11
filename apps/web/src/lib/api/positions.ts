import { PublicKey } from "@solana/web3.js";
import type { PositionRecord } from "@proxa/sdk";
import type { ProxaClient } from "@proxa/sdk";
import { api, isApiEnabled } from "@/lib/api/client";
import { deserializePositionRecord } from "@/lib/api/deserialize";
import type { WirePositionRecord } from "@/lib/api/types";

/** GET /positions/:wallet */
export async function fetchPositionsFromApi(wallet: string): Promise<PositionRecord[]> {
  const data = await api<WirePositionRecord[]>(`/positions/${wallet}`);
  return data.map(deserializePositionRecord);
}

/** Fetch positions from the API when configured, otherwise from chain. */
export async function fetchPositions(wallet: PublicKey, client: ProxaClient): Promise<PositionRecord[]> {
  if (isApiEnabled()) {
    return fetchPositionsFromApi(wallet.toBase58());
  }
  return client.fetchPositions(wallet);
}
