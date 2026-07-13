import { PublicKey } from "@solana/web3.js";
import type {
  ApiMarket,
  ApiPosition,
  WireMarketAccount,
  WireMarketRecord,
  WirePositionRecord,
} from "@/lib/api/types";

const PLACEHOLDER_PUBKEY = "11111111111111111111111111111111";

export interface ApiDefaults {
  stakeMint?: string;
}

function isWireMarketRecord(value: unknown): value is WireMarketRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "address" in value &&
    "account" in value
  );
}

function isWireMarketAccount(value: unknown): value is WireMarketAccount {
  return (
    typeof value === "object" &&
    value !== null &&
    "marketId" in value &&
    "creator" in value &&
    !("account" in value)
  );
}

function isApiMarket(value: unknown): value is ApiMarket {
  return (
    typeof value === "object" &&
    value !== null &&
    "marketId" in value &&
    "fixtureId" in value &&
    !("account" in value) &&
    !("creator" in value)
  );
}

/** Converts a production API market into the mock wire format for deserialization. */
export function normalizeApiMarket(
  market: ApiMarket,
  defaults: ApiDefaults = {},
): WireMarketRecord {
  const stakeMint = defaults.stakeMint ?? PLACEHOLDER_PUBKEY;

  return {
    address: market.address ?? PLACEHOLDER_PUBKEY,
    account: {
      marketId: market.marketId,
      creator: PLACEHOLDER_PUBKEY,
      fixtureId: market.fixtureId,
      statKey: market.statKey,
      numBuckets: market.numBuckets,
      betsCloseTs: market.betsCloseTs,
      resolveAfterTs: market.resolveAfterTs,
      resolveDeadlineTs: market.resolveDeadlineTs ?? market.resolveAfterTs,
      feeBps: market.feeBps ?? 100,
      stakeMint,
      vault: PLACEHOLDER_PUBKEY,
      totalPool: market.totalPool,
      bucketPools: market.bucketPools,
      status: market.status,
      winningBucket: market.winningBucket,
      winningValue: market.winningValue,
      netPool: market.netPool ?? "0",
      winningPool: market.winningPool ?? "0",
      feeCollected: market.feeCollected ?? false,
      bump: 0,
      vaultBump: 0,
    },
  };
}

/** Normalizes any supported market response shape into a wire record. */
export function normalizeMarketResponse(
  data: unknown,
  address: string,
  defaults: ApiDefaults = {},
): WireMarketRecord {
  if (isWireMarketRecord(data)) return data;
  if (isWireMarketAccount(data)) {
    return { address, account: data };
  }
  if (isApiMarket(data)) {
    return normalizeApiMarket({ ...data, address: data.address ?? address }, defaults);
  }
  throw new Error("Unsupported market response shape");
}

/** Converts a production API position into the mock wire format. */
export function normalizeApiPosition(position: ApiPosition, wallet: string): WirePositionRecord {
  return {
    address: position.address,
    account: {
      marketId: position.marketId,
      bettor: wallet,
      bucket: position.bucket,
      amount: position.amount,
      bump: 0,
    },
  };
}

/** Extracts market records from list/fixture API responses. */
export function extractMarketsFromListResponse(
  data: unknown,
  defaults: ApiDefaults = {},
): WireMarketRecord[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      isWireMarketRecord(item)
        ? item
        : normalizeApiMarket(item as ApiMarket, defaults),
    );
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    const items = (data as { data: ApiMarket[] }).data;
    return items.map((item) => normalizeApiMarket(item, defaults));
  }

  if (typeof data === "object" && data !== null && "items" in data) {
    return (data as { items: WireMarketRecord[] }).items;
  }

  throw new Error("Unsupported markets list response shape");
}

export function toPublicKey(value: string): PublicKey {
  return new PublicKey(value);
}
