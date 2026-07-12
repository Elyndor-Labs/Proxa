import { PERIOD, STAT_BASE, statKey } from "@proxa/sdk";

export interface StatOption {
  label: string;
  value: number;
}

export interface PeriodOption {
  label: string;
  value: number;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { label: "Full Match", value: PERIOD.full },
  { label: "1st Half", value: PERIOD.h1 },
  { label: "2nd Half", value: PERIOD.h2 },
  { label: "Extra Time 1", value: PERIOD.et1 },
  { label: "Extra Time 2", value: PERIOD.et2 },
  { label: "Penalties", value: PERIOD.pe },
];

export const STAT_OPTIONS: StatOption[] = [
  { label: "Goals", value: STAT_BASE.p1Goals },
  { label: "Yellow Cards", value: STAT_BASE.p1Yellow },
  { label: "Red Cards", value: STAT_BASE.p1Red },
  { label: "Corners", value: STAT_BASE.p1Corners },
];

/** Combines period + stat base into the on-chain stat_key. */
export function buildStatKey(statBase: number, period: number): number {
  return statKey(statBase, period);
}

/** Unique fixture IDs from market records, sorted descending. */
export function uniqueFixtures(fixtureIds: string[]): string[] {
  return [...new Set(fixtureIds)].sort((a, b) => Number(b) - Number(a));
}
