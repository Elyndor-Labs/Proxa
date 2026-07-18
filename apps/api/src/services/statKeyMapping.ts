import type { TxOddsSnapshot } from "./txodds";

const STAT_BASE = {
  p1Goals: 1,
  p2Goals: 2,
  p1Yellow: 3,
  p2Yellow: 4,
  p1Red: 5,
  p2Red: 6,
  p1Corners: 7,
  p2Corners: 8,
} as const;

const PERIOD = {
  full: 0,
  h1: 1000,
  h2: 2000,
  et1: 3000,
  et2: 4000,
  pe: 5000,
} as const;

export interface StatKeyMapping {
  statKey: number | null;
  statLabel: string;
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "_");
}

function parsePeriod(marketPeriod?: string): number {
  const raw = normalize(marketPeriod);
  if (!raw || raw.includes("FULL") || raw === "FT" || raw === "MATCH") return PERIOD.full;
  if (raw.includes("1ST") || raw === "H1" || raw.includes("FIRST_HALF")) return PERIOD.h1;
  if (raw.includes("2ND") || raw === "H2" || raw.includes("SECOND_HALF")) return PERIOD.h2;
  if (raw.includes("ET1") || raw.includes("EXTRA_TIME_1")) return PERIOD.et1;
  if (raw.includes("ET2") || raw.includes("EXTRA_TIME_2")) return PERIOD.et2;
  if (raw.includes("PEN") || raw.includes("SHOOTOUT")) return PERIOD.pe;
  return PERIOD.full;
}

function parseStatBase(superOddsType: string): { base: number; label: string } | null {
  const type = normalize(superOddsType);

  if (type.includes("CORNER")) {
    return { base: STAT_BASE.p1Corners, label: "Corners" };
  }
  if (type.includes("YELLOW")) {
    return { base: STAT_BASE.p1Yellow, label: "Yellow Cards" };
  }
  if (type.includes("RED") && !type.includes("YELLOW")) {
    return { base: STAT_BASE.p1Red, label: "Red Cards" };
  }
  if (type.includes("GOAL") || type.includes("SCORE")) {
    return { base: STAT_BASE.p1Goals, label: "Goals" };
  }
  if (type.includes("CARD")) {
    return { base: STAT_BASE.p1Yellow, label: "Cards" };
  }

  return null;
}

/** Map a TXOdds odds snapshot to an on-chain stat_key when the market type is recognized. */
export function mapTxOddsSnapshotToStatKey(snapshot: TxOddsSnapshot): StatKeyMapping {
  const stat = parseStatBase(snapshot.SuperOddsType);
  if (!stat) {
    return { statKey: null, statLabel: snapshot.SuperOddsType };
  }

  const period = parsePeriod(snapshot.MarketPeriod);
  const periodLabel = period === PERIOD.h1 ? "H1" : period === PERIOD.h2 ? "H2" : period === PERIOD.et1 ? "ET1" : period === PERIOD.et2 ? "ET2" : period === PERIOD.pe ? "PE" : "Full match";

  return {
    statKey: period + stat.base,
    statLabel: `${periodLabel} ${stat.label}`,
  };
}
