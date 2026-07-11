import { BN } from "@coral-xyz/anchor";
import { fromBaseUnits, quoteClaim, type ProxaClient } from "@proxa/sdk";
import { STAKE_DECIMALS } from "@/lib/proxa/market-view";
import { truncateAddress } from "@/lib/format/address";

export interface LeaderboardEntry {
  address: string;
  displayAddress: string;
  totalStaked: string;
  totalWinnings: string;
  positionCount: number;
}

/** Builds a bettor leaderboard from all on-chain position accounts. */
export async function buildLeaderboard(client: ProxaClient): Promise<LeaderboardEntry[]> {
  const [positionRows, marketRecords] = await Promise.all([
    client.program.account.position.all(),
    client.fetchAllMarkets(),
  ]);

  const marketMap = new Map(marketRecords.map((m) => [m.account.marketId.toString(), m.account]));

  const byBettor = new Map<string, { staked: BN; winnings: BN; count: number }>();

  for (const row of positionRows) {
    const bettor = row.account.bettor.toBase58();
    const market = marketMap.get(row.account.marketId.toString());
    const current = byBettor.get(bettor) ?? { staked: new BN(0), winnings: new BN(0), count: 0 };

    current.staked = current.staked.add(row.account.amount);
    current.count += 1;

    if (market) {
      current.winnings = current.winnings.add(quoteClaim(market, row.account));
    }

    byBettor.set(bettor, current);
  }

  return [...byBettor.entries()]
    .map(([address, stats]) => ({
      address,
      displayAddress: truncateAddress(address, 6),
      totalStaked: fromBaseUnits(stats.staked, STAKE_DECIMALS),
      totalWinnings: fromBaseUnits(stats.winnings, STAKE_DECIMALS),
      positionCount: stats.count,
    }))
    .sort((a, b) => Number(b.totalStaked) - Number(a.totalStaked))
    .slice(0, 50);
}
