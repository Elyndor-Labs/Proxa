import type { MarketAccount } from "@proxa/sdk";
import { bucketChancePct } from "@/lib/format/odds";

export interface OddsHistoryPoint {
  time: number;
  label: string;
  value: number;
}

/** Seeded pseudo-random for stable simulated history per market. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Simulated 24h odds history ending at current pool-implied probabilities. */
export function simulateOddsHistory(
  account: MarketAccount,
  labels: string[],
  points = 48,
): OddsHistoryPoint[] {
  const seed = Number(account.marketId) + account.fixtureId.toNumber();
  const rand = seededRandom(seed || 1);
  const now = Date.now();
  const intervalMs = (24 * 60 * 60 * 1000) / points;

  const current = labels.map((_, i) => bucketChancePct(account, i));

  const series: OddsHistoryPoint[] = [];

  for (let p = 0; p < points; p++) {
    const t = now - (points - 1 - p) * intervalMs;
    const progress = p / (points - 1);

    labels.forEach((label, i) => {
      const start = Math.max(5, Math.min(95, current[i]! + (rand() - 0.5) * 30));
      const drift = start + (current[i]! - start) * progress;
      const noise = (rand() - 0.5) * 8 * (1 - progress);
      const value = Math.max(2, Math.min(98, Math.round(drift + noise)));
      series.push({ time: t, label, value });
    });
  }

  return series;
}

/** Pivot history into recharts-friendly rows keyed by outcome label. */
export function pivotOddsHistory(
  history: OddsHistoryPoint[],
  labels: string[],
): Record<string, string | number>[] {
  const byTime = new Map<number, Record<string, string | number>>();

  for (const point of history) {
    if (!byTime.has(point.time)) {
      byTime.set(point.time, {
        time: point.time,
        label: new Date(point.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
    byTime.get(point.time)![point.label] = point.value;
  }

  const rows = [...byTime.values()].sort((a, b) => Number(a.time) - Number(b.time));

  for (const row of rows) {
    for (const label of labels) {
      if (row[label] === undefined) row[label] = 0;
    }
  }

  return rows;
}
