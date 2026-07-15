import { PERIOD, STAT_BASE, statusLabel, fromBaseUnits, bucketLabelsFromBounds, countBucketBounds } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { formatTimeRemaining } from "@/lib/format/time";

const STAKE_DECIMALS = 6;

const STAT_LABELS: Record<number, string> = {
  [STAT_BASE.p1Goals]: "P1 Goals",
  [STAT_BASE.p2Goals]: "P2 Goals",
  [STAT_BASE.p1Yellow]: "P1 Yellow Cards",
  [STAT_BASE.p2Yellow]: "P2 Yellow Cards",
  [STAT_BASE.p1Red]: "P1 Red Cards",
  [STAT_BASE.p2Red]: "P2 Red Cards",
  [STAT_BASE.p1Corners]: "P1 Corners",
  [STAT_BASE.p2Corners]: "P2 Corners",
};

const PERIOD_LABELS: Record<number, string> = {
  [PERIOD.full]: "Full Match",
  [PERIOD.h1]: "1st Half",
  [PERIOD.h2]: "2nd Half",
  [PERIOD.et1]: "ET 1",
  [PERIOD.et2]: "ET 2",
  [PERIOD.pe]: "Penalties",
};

/** UI-friendly market representation derived from on-chain state. */
export interface MarketView {
  id: string;
  fixtureId: string;
  title: string;
  statLabel: string;
  status: ReturnType<typeof statusLabel>;
  totalPool: string;
  bucketPools: string[];
  bucketLabels: string[];
  betsCloseLabel: string;
  betsCloseTs: number;
  numBuckets: number;
  isOpen: boolean;
}

function resolveStatLabel(statKey: number): string {
  const period = Object.values(PERIOD).find((p) => statKey >= p && statKey < p + 1000) ?? PERIOD.full;
  const base = statKey - period;
  const stat = STAT_LABELS[base] ?? `Stat ${base}`;
  const periodLabel = PERIOD_LABELS[period];
  return period === PERIOD.full ? stat : `${periodLabel} · ${stat}`;
}

function formatPool(amount: { toString(): string }): string {
  return `$${fromBaseUnits(amount, STAKE_DECIMALS)}`;
}

function bucketUnit(statLabel: string): string {
  const normalized = statLabel.toLowerCase();
  if (normalized.includes("corner")) return "corners";
  if (normalized.includes("yellow")) return "yellow cards";
  if (normalized.includes("red")) return "red cards";
  if (normalized.includes("goal")) return "goals";
  return "value";
}

export function toMarketView(account: MarketAccount): MarketView {
  const status = statusLabel(account.status);
  const statLabel = resolveStatLabel(account.statKey);
  const closeTs = account.betsCloseTs.toNumber() * 1000;
  const bounds = account.bucketBounds?.length
    ? account.bucketBounds
    : countBucketBounds(account.numBuckets);

  return {
    id: account.marketId.toString(),
    fixtureId: account.fixtureId.toString(),
    title: `Fixture #${account.fixtureId.toString()} · ${statLabel}`,
    statLabel,
    status,
    totalPool: formatPool(account.totalPool),
    bucketPools: account.bucketPools.map(formatPool),
    bucketLabels: bucketLabelsFromBounds(account.numBuckets, bounds, bucketUnit(statLabel)),
    betsCloseLabel: formatTimeRemaining(closeTs),
    betsCloseTs: closeTs,
    numBuckets: account.numBuckets,
    isOpen: status === "open",
  };
}

export function statusBadgeVariant(status: ReturnType<typeof statusLabel>): "success" | "brand" | "muted" | "warning" {
  if (status === "open") return "brand";
  if (status === "resolved") return "success";
  return "warning";
}

export { STAKE_DECIMALS };
