"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/components/domain/user-avatar";
import { useMarkets } from "@/hooks/use-markets";
import { synthesizeLeaderboard } from "@/lib/activity/synthesize-feed";
import { cn } from "@/lib/utils";

/** Top traders — default PFP + #rank style numbers. */
export function LeaderboardPanel({ className }: { className?: string }) {
  const { data } = useMarkets();
  const entries = useMemo(() => synthesizeLeaderboard(data ?? []), [data]);

  if (!entries.length) return null;

  return (
    <section className={cn("surface p-5", className)}>
      <h2 className="type-subheading mb-4 text-base">Leaderboard</h2>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li
            key={entry.name}
            className={cn(
              "lb-row flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-2.5",
              entry.rank <= 3 && "lb-row--podium",
              entry.rank === 1 && "lb-row--1",
              entry.rank === 2 && "lb-row--2",
              entry.rank === 3 && "lb-row--3",
            )}
          >
            <span className="lb-rank" aria-label={`Rank ${entry.rank}`}>
              #{entry.rank}
            </span>
            <UserAvatar size={28} className="lb-pfp" alt="" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-label text-sm font-semibold">{entry.name}</p>
              <div className="lb-progress mt-1.5">
                <div
                  className="lb-progress__fill"
                  style={{ width: `${Math.max(8, (entry.points / entry.maxPoints) * 100)}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-xs tabular-nums text-text-secondary">
              {entry.points.toLocaleString()} pts
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
