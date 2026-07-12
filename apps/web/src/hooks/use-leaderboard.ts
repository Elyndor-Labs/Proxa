"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { fetchLeaderboard } from "@/lib/api/leaderboard";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Fetches leaderboard ranked by total stake volume. */
export function useLeaderboard() {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: () => fetchLeaderboard(client),
    staleTime: 60_000,
  });
}
