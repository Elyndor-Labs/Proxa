import type { LeaderboardEntry } from "@/lib/proxa/leaderboard";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { leaderboardListSchema } from "@/lib/api/schemas";
import type { ProxaClient } from "@proxa/sdk";
import { buildLeaderboard } from "@/lib/proxa/leaderboard";

/** GET /leaderboard — mock API only; production backend has no leaderboard route. */
export async function fetchLeaderboard(client: ProxaClient): Promise<LeaderboardEntry[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const isLocalMockApi = apiUrl.includes("/api");

  if (isApiEnabled() && isLocalMockApi) {
    return apiParse("/leaderboard", leaderboardListSchema);
  }
  return buildLeaderboard(client);
}
