"use client";

import { useState } from "react";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { cn } from "@/lib/utils";

const TIME_TABS = [
  { label: "This Week", value: "week" },
  { label: "Last Week", value: "last" },
  { label: "All Time", value: "all" },
];

function rankBadgeClass(index: number): string {
  if (index === 0) return "rank-badge--1";
  if (index === 1) return "rank-badge--2";
  if (index === 2) return "rank-badge--3";
  return "rank-badge--default";
}

function progressFillClass(index: number): string {
  if (index === 0) return "progress-fill--gold";
  if (index === 1) return "progress-fill--silver";
  if (index === 2) return "progress-fill--bronze";
  return "progress-fill--default";
}

/** Leaderboard ranked by on-chain stake volume. */
export function LeaderboardView() {
  const [timeFilter, setTimeFilter] = useState("week");
  const { data, isLoading, isError } = useLeaderboard();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Leaderboard" description="Top traders ranked by points earned this period." />
        <div className="surface h-96 animate-pulse rounded-2xl" />
      </>
    );
  }

  if (isError || !data?.length) {
    return (
      <>
        <PageHeader title="Leaderboard" description="Top traders ranked by points earned this period." />
        <div className="surface p-8 text-center">
          <p className="font-display text-lg font-semibold">No rankings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Leaderboard populates once bettors place positions on-chain.
          </p>
        </div>
      </>
    );
  }

  const maxStaked = Math.max(...data.map((d) => Number(d.totalStaked)));
  const podium = data.slice(0, 3);

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Leaderboard"
        description="Top traders ranked by points earned this period."
        actions={
          <FilterTabs tabs={TIME_TABS} value={timeFilter} onChange={setTimeFilter} aria-label="Time period" />
        }
      />

      {/* Podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 0, 2].map((podiumIndex) => {
          const leader = podium[podiumIndex];
          if (!leader) return <div key={podiumIndex} />;
          const pts = Math.round(Number(leader.totalStaked) * 1000);
          const isFirst = podiumIndex === 0;

          return (
            <div
              key={leader.address}
              className={cn(
                "surface surface-interactive p-5 text-center",
                isFirst && "sm:-mt-2 sm:pb-7",
                podiumIndex === 1 && "animate-slide-up-delay-1",
                podiumIndex === 0 && "animate-slide-up-delay-2",
                podiumIndex === 2 && "animate-slide-up-delay-3",
              )}
            >
              <span className={cn("rank-badge mx-auto mb-3", rankBadgeClass(podiumIndex))}>
                {podiumIndex + 1}
              </span>
              <p className="font-display text-base font-bold">{leader.displayAddress}</p>
              <p className="mt-1 font-label text-xs text-muted-foreground">
                {leader.positionCount} trades
              </p>
              <p className="stat-tile__value stat-tile__value--highlight mt-3 text-2xl">
                {pts.toLocaleString()}
              </p>
              <p className="mt-0.5 font-label text-[10px] uppercase tracking-widest text-muted-foreground">pts</p>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="surface overflow-hidden">
        <div className="border-b border-[var(--surface-border)] px-6 py-4">
          <p className="section-label">Rankings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-[var(--surface-border)] text-left">
                <th className="px-6 py-3 font-label text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  #
                </th>
                <th className="px-6 py-3 font-label text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Player
                </th>
                <th className="px-6 py-3 text-right font-label text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((leader, index) => {
                const pts = Math.round(Number(leader.totalStaked) * 1000);
                const barWidth = maxStaked > 0 ? (Number(leader.totalStaked) / maxStaked) * 100 : 0;

                return (
                  <tr
                    key={leader.address}
                    className={cn("lb-row", index < 3 && "lb-row--top")}
                  >
                    <td className="px-6 py-4">
                      <span className={cn("rank-badge", rankBadgeClass(index))}>{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="avatar-ring">{leader.displayAddress.slice(0, 2)}</span>
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate font-label text-sm font-semibold", index < 3 && "text-foreground")}>
                            {leader.displayAddress}
                          </p>
                          <div className="progress-track mt-2 max-w-[10rem]">
                            <div
                              className={cn("progress-fill", progressFillClass(index))}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-label text-sm font-bold tabular-nums text-brand">
                        {pts.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
