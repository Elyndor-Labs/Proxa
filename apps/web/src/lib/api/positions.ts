import { PublicKey } from "@solana/web3.js";
import type { PositionRecord } from "@proxa/sdk";
import type { ProxaClient } from "@proxa/sdk";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { deserializePositionRecord } from "@/lib/api/deserialize";
import { wirePositionListSchema } from "@/lib/api/schemas";

/** GET /positions/:wallet */
export async function fetchPositionsFromApi(wallet: string): Promise<PositionRecord[]> {
  const data = await apiParse(`/positions/${wallet}`, wirePositionListSchema);
  return data.map(deserializePositionRecord);
}

/** Fetch positions from the API when configured, otherwise from chain. */
export async function fetchPositions(wallet: PublicKey, client: ProxaClient): Promise<PositionRecord[]> {
  if (isApiEnabled()) {
    return fetchPositionsFromApi(wallet.toBase58());
  }
  return client.fetchPositions(wallet);
}
