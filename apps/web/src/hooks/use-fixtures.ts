"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiEnabled } from "@/config/api";
import { fetchFixtures } from "@/lib/api/fixtures";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches enriched fixtures with TXOdds candidates from the REST API when available. */
export function useFixtures() {
  return useQuery({
    queryKey: queryKeys.fixtures,
    queryFn: fetchFixtures,
    enabled: isApiEnabled(),
  });
}
