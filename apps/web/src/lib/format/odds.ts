import { previewBet } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { BN } from "@coral-xyz/anchor";
import { fromBaseUnits } from "@proxa/sdk";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";

/** Implied decimal odds from parimutuel preview (e.g. "1.85"). */
export function formatOdds(market: MarketAccount, bucket: number): string {
  const preview = previewBet(market, bucket, new BN(1_000_000));
  if (preview.multiplierBps === 0) return "—";
  return (preview.multiplierBps / 10_000).toFixed(2);
}

/** Format a stake amount for display. */
export function formatStake(amount: BN): string {
  return fromBaseUnits(amount, STAKE_DECIMALS);
}

/** Implied pool share for a bucket (0–100). */
export function bucketChancePct(market: MarketAccount, bucket: number): number {
  const total = market.totalPool;
  if (total.isZero()) return 0;
  return market.bucketPools[bucket].muln(100).div(total).toNumber();
}

