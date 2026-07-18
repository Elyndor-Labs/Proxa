import type { MarketRecord } from "@proxa/sdk";
import type { MarketView } from "@/lib/proxa/market-view";
import { bucketPriceCents } from "@/lib/format/odds";

export interface ActivityItem {
  id: string;
  trader: string;
  action: "Bought" | "Sold";
  side: string;
  amount: string;
  marketTitle: string;
  marketId: string;
  outcome: string;
  ago: string;
}

const TRADER_NAMES = [
  "KingJSA1",
  "solwhale",
  "parlay.eth",
  "minttrader",
  "onchain.alpha",
  "fixture.fan",
  "pool.runner",
  "green.candle",
] as const;

function seededPick<T>(seed: number, items: readonly T[]): T {
  return items[Math.abs(seed) % items.length]!;
}

function formatAgo(minutesAgo: number): string {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const h = Math.floor(minutesAgo / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Synthesize live activity from open markets until a real trade feed exists. */
export function synthesizeActivityFeed(
  markets: { record: MarketRecord; view: MarketView }[],
  count = 16,
): ActivityItem[] {
  const open = markets.filter(({ view }) => view.isOpen);
  const source = open.length ? open : markets;
  if (!source.length) return [];

  const items = Array.from({ length: Math.min(count, source.length * 2) }, (_, i) => {
    const { record, view } = source[i % source.length]!;
    const seed = Number(view.id) * 31 + i * 17;
    const bucket = seed % view.numBuckets;
    const cents = bucketPriceCents(record.account, bucket);
    const side = view.numBuckets === 2 ? (bucket === 0 ? "YES" : "NO") : view.bucketLabels[bucket] ?? "YES";
    const trader = seededPick(seed, TRADER_NAMES);
    const minutesAgo = (seed % 180) + 1;
    const amount = ((seed % 18) / 10 + 0.5).toFixed(2);

    return {
      id: `${view.id}-${i}`,
      trader: `@${trader}`,
      action: (seed % 5 === 0 ? "Sold" : "Bought") as ActivityItem["action"],
      side,
      amount: `$${amount}`,
      marketTitle: view.statLabel,
      marketId: view.id,
      outcome: `${side} ${cents}¢`,
      ago: formatAgo(minutesAgo),
      minutesAgo,
    };
  }).sort((a, b) => a.minutesAgo - b.minutesAgo);

  return items.map((item) => ({
    id: item.id,
    trader: item.trader,
    action: item.action,
    side: item.side,
    amount: item.amount,
    marketTitle: item.marketTitle,
    marketId: item.marketId,
    outcome: item.outcome,
    ago: item.ago,
  }));
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  maxPoints: number;
}

/** Rank traders by synthesized volume from market pools. */
export function synthesizeLeaderboard(
  markets: { record: MarketRecord; view: MarketView }[],
): LeaderboardEntry[] {
  const entries = TRADER_NAMES.map((name, i) => {
    const market = markets[i % Math.max(markets.length, 1)];
    const poolNum = market
      ? Number(market.view.totalPool.replace(/[^0-9.]/g, "")) || 10
      : 10 + i * 7;
    return {
      rank: 0,
      name: `@${name}`,
      points: Math.round(poolNum * (1.2 - i * 0.08) * 100),
      maxPoints: 0,
    };
  })
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  const maxPoints = entries[0]?.points ?? 1;
  return entries.map((e, i) => ({
    ...e,
    rank: i + 1,
    maxPoints,
  }));
}
