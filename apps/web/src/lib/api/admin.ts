import { z } from "zod";
import { fixtureCandidateSchema } from "@/lib/api/fixtures";

const syncOddsSchema = z.object({
  fixtureId: z.number(),
  oddsCreated: z.number(),
  candidatesCreated: z.number(),
  snapshots: z.number(),
});
const candidateListSchema = z.object({
  data: z.array(fixtureCandidateSchema),
});
const linkMarketSchema = z.object({
  candidate: fixtureCandidateSchema,
  market: z.object({
    id: z.number(),
    fixtureId: z.number(),
    statKey: z.number(),
  }),
});

async function adminFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      const body = JSON.parse(text) as { error?: string };
      message = body.error ?? text;
    } catch {
      // keep raw text
    }
    throw new Error(message || "Admin request failed");
  }
  return text ? JSON.parse(text) : null;
}

export async function syncFixtures(body?: { startEpochDay?: number; competitionId?: number; days?: number }) {
  const json = await adminFetch("txodds/sync-fixtures", {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
  return z.object({ count: z.number(), days: z.number().optional() }).parse(json);
}

export async function syncFixtureOdds(fixtureId: number) {
  const json = await adminFetch(`txodds/fixtures/${fixtureId}/sync-odds`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return syncOddsSchema.parse(json);
}

export async function fetchAdminCandidates(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const json = await adminFetch(`candidates${query}`);
  return candidateListSchema.parse(json).data;
}

export async function updateCandidateStatus(candidateId: string, status: string) {
  const json = await adminFetch(`candidates/${candidateId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return fixtureCandidateSchema.parse(json);
}

export async function linkCandidateMarket(
  candidateId: string,
  marketId: number,
  statKey: number,
) {
  const json = await adminFetch(`candidates/${candidateId}/link-market`, {
    method: "POST",
    body: JSON.stringify({ marketId, statKey }),
  });
  return linkMarketSchema.parse(json);
}
