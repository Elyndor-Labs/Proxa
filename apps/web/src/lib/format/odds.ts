import { previewBet } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { BN } from "@coral-xyz/anchor";
import { fromBaseUnits } from "@proxa/sdk";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";

export type OutcomeSentiment = "positive" | "negative" | "neutral";

/** Standardized outcome quote for display across cards and tables. */
export interface OutcomeQuote {
  label: string;
  odds: string;
  cents: number;
  probability: number;
  /** Unified format: "1.39 · 50¢" */
  display: string;
  sentiment: OutcomeSentiment;
}

/** Implied decimal odds from parimutuel preview (e.g. "1.85"). */
export function formatOdds(market: MarketAccount, bucket: number): string {
  const preview = previewBet(market, bucket, new BN(1_000_000));
  if (preview.multiplierBps === 0) return "—";
  return (preview.multiplierBps / 10_000).toFixed(2);
}

/** Standard price string used everywhere: decimal odds + implied cents. */
export function formatOutcomePrice(market: MarketAccount, bucket: number): string {
  const odds = formatOdds(market, bucket);
  if (odds === "—") return "—";
  const cents = bucketPriceCents(market, bucket);
  return `${odds} · ${cents}¢`;
}

function outcomeSentiment(market: MarketAccount, bucket: number): OutcomeSentiment {
  if (market.numBuckets !== 2) return "neutral";
  return bucket === 0 ? "positive" : "negative";
}

/** Build outcome quotes for all buckets in a market. */
export function getOutcomeQuotes(market: MarketAccount, labels: string[]): OutcomeQuote[] {
  return labels.map((label, index) => {
    const probability = bucketChancePct(market, index);
    const cents = bucketPriceCents(market, index);
    const odds = formatOdds(market, index);
    return {
      label,
      odds,
      cents,
      probability,
      display: formatOutcomePrice(market, index),
      sentiment: outcomeSentiment(market, index),
    };
  });
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

/** Implied price in cents from parimutuel pool share. */
export function bucketPriceCents(market: MarketAccount, bucket: number): number {
  const pct = bucketChancePct(market, bucket);
  return Math.max(1, Math.min(99, Math.round(pct)));
}
