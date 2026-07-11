"use client";

import { useQuery } from "@tanstack/react-query";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { buildLeaderboard } from "@/lib/proxa/leaderboard";

/** Fetches on-chain leaderboard ranked by total stake volume. */
export function useLeaderboard() {
  const { client } = useProxaClient();

  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => buildLeaderboard(client),
    staleTime: 60_000,
  });
}
