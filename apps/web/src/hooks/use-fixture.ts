"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiEnabled } from "@/config/api";
import { fetchFixtureDetail } from "@/lib/api/fixtures";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches enriched fixture metadata from the REST API when available. */
export function useFixture(fixtureId: string) {
  return useQuery({
    queryKey: queryKeys.fixtureDetail(fixtureId),
    queryFn: () => fetchFixtureDetail(fixtureId),
    enabled: Boolean(fixtureId) && isApiEnabled(),
  });
}
