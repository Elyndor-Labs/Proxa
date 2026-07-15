import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export type MarketStatus = { open: {} } | { resolved: {} } | { voided: {} };

export interface ConfigAccount {
  authority: PublicKey;
  stakeMint: PublicKey;
  treasury: PublicKey;
  feeBps: number;
  marketCount: BN;
  bump: number;
}

export interface MarketAccount {
  marketId: BN;
  creator: PublicKey;
  fixtureId: BN;
  statKey: number;
  numBuckets: number;
  bucketBounds: number[];
  betsCloseTs: BN;
  resolveAfterTs: BN;
  resolveDeadlineTs: BN;
  feeBps: number;
  stakeMint: PublicKey;
  vault: PublicKey;
  totalPool: BN;
  bucketPools: BN[];
  status: MarketStatus;
  winningBucket: number;
  winningValue: number;
  netPool: BN;
  winningPool: BN;
  feeCollected: boolean;
  bump: number;
  vaultBump: number;
}

export interface PositionAccount {
  marketId: BN;
  bettor: PublicKey;
  bucket: number;
  amount: BN;
  bump: number;
}

export function statusLabel(status: MarketStatus): "open" | "resolved" | "voided" {
  if ("resolved" in status) return "resolved";
  if ("voided" in status) return "voided";
  return "open";
}

export function isResolved(status: MarketStatus): boolean {
  return "resolved" in status;
}
