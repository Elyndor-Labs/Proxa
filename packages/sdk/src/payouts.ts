import { BN } from "@coral-xyz/anchor";
import { MarketAccount, PositionAccount, statusLabel } from "./accounts";

const BPS_DENOM = new BN(10_000);

export function feeAmount(totalPool: BN, feeBps: number): BN {
  return totalPool.mul(new BN(feeBps)).div(BPS_DENOM);
}

export function netPool(totalPool: BN, feeBps: number): BN {
  return totalPool.sub(feeAmount(totalPool, feeBps));
}

export interface BetPreview {
  projectedPayout: BN;
  multiplierBps: number;
}

// Projected parimutuel payout for adding `amount` to `bucket`, assuming it wins.
// Uses current pools, so the real payout shifts as others bet.
export function previewBet(market: MarketAccount, bucket: number, amount: BN): BetPreview {
  const total = market.totalPool.add(amount);
  const net = netPool(total, market.feeBps);
  const bucketPool = market.bucketPools[bucket].add(amount);
  if (bucketPool.isZero() || amount.isZero()) {
    return { projectedPayout: new BN(0), multiplierBps: 0 };
  }
  const projectedPayout = amount.mul(net).div(bucketPool);
  const multiplierBps = projectedPayout.mul(BPS_DENOM).div(amount).toNumber();
  return { projectedPayout, multiplierBps };
}

// Actual claimable for a position on a settled market. Mirrors the program's claim logic.
export function quoteClaim(market: MarketAccount, position: PositionAccount): BN {
  const status = statusLabel(market.status);
  if (status === "voided") return position.amount;
  if (status === "resolved" && position.bucket === market.winningBucket && !market.winningPool.isZero()) {
    return position.amount.mul(market.netPool).div(market.winningPool);
  }
  return new BN(0);
}
