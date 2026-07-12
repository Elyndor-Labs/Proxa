import type { LeaderboardEntry } from "@/lib/proxa/leaderboard";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { leaderboardListSchema } from "@/lib/api/schemas";
import type { ProxaClient } from "@proxa/sdk";
import { buildLeaderboard } from "@/lib/proxa/leaderboard";

/** GET /leaderboard */
export async function fetchLeaderboard(client: ProxaClient): Promise<LeaderboardEntry[]> {
  if (isApiEnabled()) {
    return apiParse("/leaderboard", leaderboardListSchema);
  }
  return buildLeaderboard(client);
}
