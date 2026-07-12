import type { WireMarketRecord, WirePositionRecord } from "@/lib/api/types";
import type { LeaderboardEntry } from "@/lib/proxa/leaderboard";

/** Valid base58 pubkeys for mock records (deserialize checks these). */
const KEYS = {
  creator: "11111111111111111111111111111111",
  stakeMint: "So11111111111111111111111111111111111111112",
  market1: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  market2: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  market3: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  vault1: "SysvarC1ock11111111111111111111111111111111",
  vault2: "SysvarRent111111111111111111111111111111111",
  vault3: "Vote111111111111111111111111111111111111111",
  pos1: "Config1111111111111111111111111111111111111",
  pos2: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
} as const;

const FIXTURE_ID = "17271370";

const BETS_CLOSE_TS = "1785000000";
const RESOLVE_AFTER_TS = "1785003600";
const RESOLVE_DEADLINE_TS = "1785086400";

function openMarket(
  id: string,
  address: string,
  vault: string,
  statKey: number,
  pools: [string, string],
): WireMarketRecord {
  const total = String(Number(pools[0]) + Number(pools[1]));
  return {
    address,
    account: {
      marketId: id,
      creator: KEYS.creator,
      fixtureId: FIXTURE_ID,
      statKey,
      numBuckets: 2,
      betsCloseTs: BETS_CLOSE_TS,
      resolveAfterTs: RESOLVE_AFTER_TS,
      resolveDeadlineTs: RESOLVE_DEADLINE_TS,
      feeBps: 200,
      stakeMint: KEYS.stakeMint,
      vault,
      totalPool: total,
      bucketPools: pools,
      status: "open",
      winningBucket: 0,
      winningValue: 0,
      netPool: "0",
      winningPool: "0",
      feeCollected: false,
      bump: 255,
      vaultBump: 254,
    },
  };
}

export const MOCK_MARKETS: WireMarketRecord[] = [
  openMarket("1", KEYS.market1, KEYS.vault1, 1001, ["3000000", "2000000"]),
  openMarket("2", KEYS.market2, KEYS.vault2, 1002, ["1500000", "2500000"]),
  openMarket("3", KEYS.market3, KEYS.vault3, 2001, ["800000", "1200000"]),
];

export function getMockMarket(id: string): WireMarketRecord | undefined {
  return MOCK_MARKETS.find((m) => String(m.account.marketId) === id);
}

export function getMockMarketsByFixture(fixtureId: string): WireMarketRecord[] {
  return MOCK_MARKETS.filter((m) => String(m.account.fixtureId) === fixtureId);
}

function wireMarketStatus(record: WireMarketRecord): string {
  const status = record.account.status;
  if (typeof status === "string") return status;
  if ("open" in status) return "open";
  if ("resolved" in status) return "resolved";
  return "voided";
}

export interface MockMarketFilters {
  status?: string | null;
  fixtureId?: string | null;
  q?: string | null;
}

/** Filters mock markets for GET /markets query params. */
export function filterMockMarkets({ status, fixtureId, q }: MockMarketFilters): WireMarketRecord[] {
  const query = q?.trim().toLowerCase() ?? "";

  return MOCK_MARKETS.filter((record) => {
    const account = record.account;

    if (status && status !== "all" && wireMarketStatus(record) !== status) {
      return false;
    }

    if (fixtureId && String(account.fixtureId) !== fixtureId) {
      return false;
    }

    if (!query) return true;

    return (
      String(account.marketId).includes(query) ||
      String(account.fixtureId).includes(query) ||
      String(account.statKey).includes(query)
    );
  }).sort((a, b) => Number(b.account.marketId) - Number(a.account.marketId));
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    address: "11111111111111111111111111111111",
    displayAddress: "ZeroXirem",
    totalStaked: "3.829",
    totalWinnings: "1.2",
    positionCount: 45,
  },
  {
    address: "So11111111111111111111111111111111111111112",
    displayAddress: "BALI69",
    totalStaked: "2.95",
    totalWinnings: "0.8",
    positionCount: 38,
  },
  {
    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    displayAddress: "KingJSA1",
    totalStaked: "2.41",
    totalWinnings: "0.5",
    positionCount: 31,
  },
  {
    address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    displayAddress: "degen_dave",
    totalStaked: "1.87",
    totalWinnings: "0.3",
    positionCount: 28,
  },
  {
    address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    displayAddress: "alpha_andy",
    totalStaked: "1.52",
    totalWinnings: "0.2",
    positionCount: 22,
  },
  {
    address: "Vote111111111111111111111111111111111111111",
    displayAddress: "clutch_queen",
    totalStaked: "1.21",
    totalWinnings: "0.1",
    positionCount: 18,
  },
  {
    address: "Config1111111111111111111111111111111111111",
    displayAddress: "based_trader",
    totalStaked: "0.98",
    totalWinnings: "0",
    positionCount: 15,
  },
  {
    address: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    displayAddress: "prop_hunter",
    totalStaked: "0.75",
    totalWinnings: "0",
    positionCount: 12,
  },
];

export function getMockLeaderboard(): LeaderboardEntry[] {
  return MOCK_LEADERBOARD;
}

export function getMockPositions(wallet: string): WirePositionRecord[] {
  return [
    {
      address: KEYS.pos1,
      account: { marketId: "1", bettor: wallet, bucket: 0, amount: "500000", bump: 255 },
    },
    {
      address: KEYS.pos2,
      account: { marketId: "2", bettor: wallet, bucket: 1, amount: "250000", bump: 254 },
    },
  ];
}
