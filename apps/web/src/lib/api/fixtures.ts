import { z } from "zod";
import { apiParse } from "@/lib/api/client";

const rawJsonSchema = z.unknown().nullable().optional();

const fixtureMarketSchema = z.object({
  id: z.number(),
  fixtureId: z.number(),
  statKey: z.number(),
  statLabel: z.string(),
  title: z.string().nullable().optional(),
  marketType: z.string().nullable().optional(),
  externalMarketId: z.string().nullable().optional(),
  onChainAddress: z.string().nullable().optional(),
  status: z.string(),
  winningBucket: z.number().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const fixtureCandidateSchema = z.object({
  id: z.string(),
  fixtureId: z.number(),
  source: z.string(),
  sourceMarketId: z.string().nullable().optional(),
  statKey: z.number().nullable().optional(),
  statLabel: z.string(),
  marketType: z.string(),
  title: z.string(),
  numBuckets: z.number(),
  status: z.string(),
  startsAt: z.string().nullable().optional(),
  onChainMarketId: z.number().nullable().optional(),
  raw: rawJsonSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  onChainMarket: fixtureMarketSchema.nullable().optional(),
});

export const oddsSnapshotSchema = z.object({
  id: z.string(),
  fixtureId: z.number(),
  provider: z.string(),
  marketKey: z.string(),
  marketName: z.string(),
  selection: z.string(),
  priceDecimal: z.number().nullable().optional(),
  impliedProbability: z.number().nullable().optional(),
  raw: rawJsonSchema,
  capturedAt: z.string(),
});

export const fixtureDetailSchema = z.object({
  id: z.number(),
  externalSource: z.string(),
  externalId: z.string().nullable().optional(),
  sport: z.string(),
  country: z.string().nullable().optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  league: z.string(),
  startsAt: z.string(),
  status: z.string(),
  lastSyncedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  markets: z.array(fixtureMarketSchema).default([]),
  candidates: z.array(fixtureCandidateSchema).default([]),
  odds: z.array(oddsSnapshotSchema).default([]),
});

const fixtureListSchema = z.object({
  data: z.array(fixtureDetailSchema),
});

const fixtureCandidateListSchema = z.object({
  data: z.array(fixtureCandidateSchema),
});

const oddsSnapshotListSchema = z.object({
  data: z.array(oddsSnapshotSchema),
});

export type FixtureDetail = z.infer<typeof fixtureDetailSchema>;
export type FixtureCandidate = z.infer<typeof fixtureCandidateSchema>;
export type OddsSnapshot = z.infer<typeof oddsSnapshotSchema>;

export async function fetchFixtures(): Promise<FixtureDetail[]> {
  const data = await apiParse("/fixtures", fixtureListSchema);
  return data.data;
}

export async function fetchFixtureDetail(fixtureId: string): Promise<FixtureDetail> {
  return apiParse(`/fixtures/${fixtureId}`, fixtureDetailSchema);
}

export async function fetchFixtureCandidates(fixtureId: string): Promise<FixtureCandidate[]> {
  const data = await apiParse(`/fixtures/${fixtureId}/candidates`, fixtureCandidateListSchema);
  return data.data;
}

export async function fetchFixtureOdds(fixtureId: string): Promise<OddsSnapshot[]> {
  const data = await apiParse(`/fixtures/${fixtureId}/odds`, oddsSnapshotListSchema);
  return data.data;
}
