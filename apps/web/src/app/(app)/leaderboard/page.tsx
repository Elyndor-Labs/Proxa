import type { Metadata } from "next";
import { LeaderboardView } from "@/features/leaderboard/leaderboard-view";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Leaderboard", "Top bettors ranked by total stake on Proxa.");

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
