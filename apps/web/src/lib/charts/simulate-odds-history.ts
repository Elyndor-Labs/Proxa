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

function normalizeToPercent(values: number[]): number[] {
  const sum = values.reduce((acc, v) => acc + v, 0);
  if (sum <= 0) {
    const even = Math.floor(100 / values.length);
    const out = values.map(() => even);
    out[0] = 100 - even * (values.length - 1);
    return out;
  }

  const scaled = values.map((v) => (v / sum) * 100);
  const rounded = scaled.map((v) => Math.max(1, Math.round(v)));
  let diff = 100 - rounded.reduce((acc, v) => acc + v, 0);

  let i = 0;
  while (diff !== 0 && i < rounded.length * 4) {
    const idx = i % rounded.length;
    if (diff > 0) {
      rounded[idx]! += 1;
      diff -= 1;
    } else if (rounded[idx]! > 1) {
      rounded[idx]! -= 1;
      diff += 1;
    }
    i += 1;
  }

  return rounded;
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
  const intervalMs = (24 * 60 * 60 * 1000) / Math.max(points - 1, 1);

  const current = labels.map((_, i) => bucketChancePct(account, i));
  const starts = normalizeToPercent(
    current.map((c) => Math.max(5, Math.min(95, c + (rand() - 0.5) * 30))),
  );

  const series: OddsHistoryPoint[] = [];

  for (let p = 0; p < points; p++) {
    const t = now - (points - 1 - p) * intervalMs;
    const isLast = p === points - 1;

    const values = isLast
      ? current
      : normalizeToPercent(
          labels.map((_, i) => {
            const progress = p / (points - 1);
            const drift = starts[i]! + (current[i]! - starts[i]!) * progress;
            const noise = (rand() - 0.5) * 8 * (1 - progress);
            return Math.max(1, drift + noise);
          }),
        );

    labels.forEach((label, i) => {
      series.push({ time: t, label, value: values[i]! });
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
