import { PublicKey } from "@solana/web3.js";
import type { PositionRecord } from "@proxa/sdk";
import type { ProxaClient } from "@proxa/sdk";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { deserializePositionRecord } from "@/lib/api/deserialize";
import { normalizeApiPosition } from "@/lib/api/normalize";
import { positionsListResponseSchema } from "@/lib/api/schemas";
import type { ApiPosition } from "@/lib/api/types";

function extractPositionsFromResponse(data: unknown, wallet: string) {
  if (Array.isArray(data)) {
    return data.map((item) =>
      "account" in item ? item : normalizeApiPosition(item as ApiPosition, wallet),
    );
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    return (data as { data: ApiPosition[] }).data.map((item) => normalizeApiPosition(item, wallet));
  }

  throw new Error("Unsupported positions list response shape");
}

/** GET /positions/:wallet */
export async function fetchPositionsFromApi(wallet: string): Promise<PositionRecord[]> {
  const data = await apiParse(`/positions/${wallet}`, positionsListResponseSchema);
  return extractPositionsFromResponse(data, wallet).map(deserializePositionRecord);
}

/** Fetch positions from the API when configured, otherwise from chain. */
export async function fetchPositions(wallet: PublicKey, client: ProxaClient): Promise<PositionRecord[]> {
  if (isApiEnabled()) {
    return fetchPositionsFromApi(wallet.toBase58());
  }
  return client.fetchPositions(wallet);
}
