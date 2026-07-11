import { BN } from "@coral-xyz/anchor";
import { fromBaseUnits } from "@proxa/sdk";
import type { MarketRecord } from "@proxa/sdk";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";

export interface ProtocolStats {
  totalTvl: string;
  openMarkets: number;
  resolvedMarkets: number;
  totalMarkets: number;
}

/** Aggregates protocol-wide stats from on-chain market records. */
export function aggregateProtocolStats(records: MarketRecord[]): ProtocolStats {
  const totalLamports = records.reduce((sum, r) => sum.add(r.account.totalPool), new BN(0));

  let openMarkets = 0;
  let resolvedMarkets = 0;

  for (const { account } of records) {
    if ("open" in account.status) openMarkets++;
    if ("resolved" in account.status) resolvedMarkets++;
  }

  return {
    totalTvl: `$${fromBaseUnits(totalLamports, STAKE_DECIMALS)}`,
    openMarkets,
    resolvedMarkets,
    totalMarkets: records.length,
  };
}
