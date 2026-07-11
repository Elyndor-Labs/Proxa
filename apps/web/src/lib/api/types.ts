/** JSON wire types returned by the Proxa REST API. */

export type WireMarketStatus = "open" | "resolved" | "voided" | { open: Record<string, never> } | { resolved: Record<string, never> } | { voided: Record<string, never> };

export interface WireMarketAccount {
  marketId: string | number;
  creator: string;
  fixtureId: string | number;
  statKey: number;
  numBuckets: number;
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
