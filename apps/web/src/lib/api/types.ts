/** JSON wire types returned by the Proxa REST API. */

export type WireMarketStatus =
  | "open"
  | "resolved"
  | "voided"
  | { open: Record<string, never> }
  | { resolved: Record<string, never> }
  | { voided: Record<string, never> }
  | { Open: Record<string, never> }
  | { Resolved: Record<string, never> }
  | { Voided: Record<string, never> };

export interface WireMarketAccount {
  marketId: string | number;
  creator: string;
  fixtureId: string | number;
  statKey: number;
  numBuckets: number;
  bucketBounds?: number[];
  betsCloseTs: string | number;
  resolveAfterTs: string | number;
  resolveDeadlineTs: string | number;
  feeBps: number;
  stakeMint: string;
  vault: string;
  totalPool: string | number;
  bucketPools: (string | number)[];
  status: WireMarketStatus;
  winningBucket: number;
  winningValue: number;
  netPool: string | number;
  winningPool: string | number;
  feeCollected: boolean;
  bump: number;
  vaultBump: number;
}

export interface WireMarketRecord {
  address: string;
  account: WireMarketAccount;
}

export interface WireMarketsListResponse {
  items: WireMarketRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface WirePositionAccount {
  marketId: string | number;
  bettor: string;
  bucket: number;
  amount: string | number;
  bump: number;
}

export interface WirePositionRecord {
  address: string;
  account: WirePositionAccount;
}

/** Flat market shape returned by the production API (apps/api). */
export interface ApiMarket {
  marketId: string | number;
  fixtureId: string | number;
  statKey: number;
  status: "open" | "resolved" | "voided";
  numBuckets: number;
  bucketBounds?: number[];
  winningBucket: number;
  winningValue: number;
  totalPool: string | number;
  bucketPools: (string | number)[];
  betsCloseTs: string | number;
  resolveAfterTs: string | number;
  resolveDeadlineTs?: string | number;
  netPool?: string | number;
  winningPool?: string | number;
  feeBps?: number;
  feeCollected?: boolean;
  address?: string;
}

/** Flat position shape returned by the production API. */
export interface ApiPosition {
  address: string;
  marketId: string | number;
  bucket: number;
  amount: string | number;
}

export interface ApiConfig {
  authority: string;
  stakeMint: string;
  treasury: string;
  feeBps: number;
  marketCount: string | number;
}

export interface ApiDataResponse<T> {
  data: T;
}

export interface Notification {
  id: string;
  wallet: string;
  marketId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
