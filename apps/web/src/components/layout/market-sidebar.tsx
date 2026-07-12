"use client";

import Link from "next/link";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { cn } from "@/lib/utils";

const TRENDING = [
  { rank: 1, word: "Enzo Fernández", trades: 847, market: "France vs Spain" },
  { rank: 2, word: "Unai Simón", trades: 623, market: "Spain commentary" },
  { rank: 3, word: "Michael Olise", trades: 512, market: "Bayern presser" },
  { rank: 4, word: "Youri Tielemans", trades: 389, market: "Belgium vs Wales" },
  { rank: 5, word: "Achraf Hakimi", trades: 301, market: "PSG interview" },
];

function rankBadgeClass(index: number): string {
  if (index === 0) return "rank-badge--1";
  if (index === 1) return "rank-badge--2";
  if (index === 2) return "rank-badge--3";
  return "rank-badge--default";
}

/** Right sidebar for markets page. */
export function MarketSidebar() {
  const { data: leaderboard } = useLeaderboard();
  const topTraders = leaderboard?.slice(0, 5) ?? [];

  return (
    <aside className="animate-slide-up-delay-2 space-y-5">
      <div className="surface surface-interactive p-5">
        <p className="section-label mb-4">Trending Words · 7d</p>
        <div className="space-y-0.5">
          {TRENDING.map((item, i) => (
            <div key={item.word} className="data-row">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className={cn("rank-badge shrink-0 text-[10px]", rankBadgeClass(i))}>
                  {item.rank}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-label text-sm font-semibold">{item.word}</span>
                  <span className="block truncate font-label text-[11px] text-muted-foreground">
                    {item.market}
                  </span>
                </span>
              </span>
              <span className="shrink-0 font-label text-[11px] font-medium tabular-nums text-muted-foreground">
                {item.trades}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface surface-interactive p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="section-label">Top Traders</p>
          <Link href="/leaderboard" className="link-arrow">
            Full rankings
          </Link>
        </div>
        <div className="space-y-0.5">
          {topTraders.length > 0 ? (
            topTraders.map((trader, index) => (
              <div key={trader.address} className="data-row">
                <span className="flex items-center gap-2.5">
                  <span className={cn("rank-badge shrink-0 text-[10px]", rankBadgeClass(index))}>
                    {index + 1}
                  </span>
                  <span className="avatar-ring h-7 w-7 text-[10px]">
                    {trader.displayAddress.slice(0, 2)}
                  </span>
                  <span className="font-label text-sm font-semibold">{trader.displayAddress}</span>
                </span>
                <span className="font-label text-xs font-bold tabular-nums text-brand">
                  +{Math.round(Number(trader.totalStaked) * 1000)}
                </span>
              </div>
            ))
          ) : (
            <p className="py-4 text-center font-label text-sm text-muted-foreground">No traders yet</p>
          )}
        </div>
      </div>
    </aside>
  );
}
