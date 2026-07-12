"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { cn } from "@/lib/utils";

const TIME_TABS = [
  { label: "This Week", value: "week" },
  { label: "Last Week", value: "last" },
  { label: "All Time", value: "all" },
];

const RANK_STYLES = [
  "text-brand",
  "text-muted-foreground",
  "text-warning",
] as const;

/** Leaderboard ranked by on-chain stake volume — mentioned.market style. */
export function LeaderboardView() {
  const [timeFilter, setTimeFilter] = useState("week");
  const { data, isLoading, isError } = useLeaderboard();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Leaderboard" description="Points leaderboard" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </>
    );
  }

  if (isError || !data?.length) {
    return (
      <>
        <PageHeader title="Leaderboard" description="Points leaderboard" />
        <Card>
          <CardHeader>
            <CardTitle>No rankings yet</CardTitle>
            <CardDescription>Leaderboard populates once bettors place positions on-chain.</CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  const maxStaked = Math.max(...data.map((d) => Number(d.totalStaked)));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <PageHeader
          title="Leaderboard"
          description="Points leaderboard"
          actions={
            <FilterTabs
              tabs={TIME_TABS}
              value={timeFilter}
              onChange={setTimeFilter}
              aria-label="Time period"
            />
          }
        />

        <Card>
          <CardHeader className="pb-2">
            <p className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Rankings
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[480px] font-label text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 pb-3 font-medium">#</th>
                  <th className="px-6 pb-3 font-medium">Player</th>
                  <th className="px-6 pb-3 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.map((leader, index) => {
                  const pts = Math.round(Number(leader.totalStaked) * 1000);
                  const barWidth = maxStaked > 0 ? (Number(leader.totalStaked) / maxStaked) * 100 : 0;

                  return (
                    <tr
                      key={leader.address}
                      className={cn(
                        "border-b border-border/50 transition-colors",
                        index < 3 && "bg-muted/20",
                      )}
                    >
                      <td className={cn("px-6 py-4 font-medium", RANK_STYLES[index] ?? "text-muted-foreground")}>
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {leader.displayAddress.slice(0, 2)}
                          </span>
                          <div>
                            <p className={cn("font-medium", index < 3 && RANK_STYLES[index])}>
                              {leader.displayAddress}
                            </p>
                            <div className="mt-1 h-1 w-32 max-w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  index === 0 ? "bg-brand" : index === 1 ? "bg-muted-foreground/50" : index === 2 ? "bg-warning/60" : "bg-border",
                                )}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-brand">
                        {pts.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">How to Earn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-label text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">🎯 Win a trade</span>
              <span className="text-brand">+50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">💬 Chat message</span>
              <span className="text-brand">+2</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="font-medium">🏅 Achievements</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Unlock weekly achievements to earn bonus points.
              </p>
            </div>
            <Link href="/#how-it-works" className="block text-center text-sm text-brand hover:underline">
              Learn more
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
