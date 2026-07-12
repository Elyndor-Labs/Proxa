"use client";

import Link from "next/link";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Right sidebar for markets page — trending and top traders. */
export function MarketSidebar() {
  const { data: leaderboard } = useLeaderboard();

  const trending = [
    { rank: 1, word: "Enzo Fernández", trades: 847 },
    { rank: 2, word: "Unai Simón", trades: 623 },
    { rank: 3, word: "Michael Olise", trades: 512 },
    { rank: 4, word: "Youri Tielemans", trades: 389 },
    { rank: 5, word: "Achraf Hakimi", trades: 301 },
  ];

  const topTraders = leaderboard?.slice(0, 5) ?? [];

  return (
    <aside className="animate-slide-up-delay-2 space-y-6">
      <Card className="hover-lift border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trending Words · 7d
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trending.map((item) => (
            <div key={item.word} className="flex items-center justify-between font-label text-sm">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">#{item.rank}</span>
                <span>{item.word}</span>
              </span>
              <span className="text-xs text-muted-foreground">{item.trades} trades</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="hover-lift border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Top Traders
          </CardTitle>
          <Link href="/leaderboard" className="font-label text-xs text-brand hover:underline">
            Full rankings
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTraders.length > 0 ? (
            topTraders.map((trader, index) => (
              <div key={trader.address} className="flex items-center justify-between font-label text-sm">
                <span className="flex items-center gap-2">
                  <span>{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
                  <span className="font-mono text-xs">{trader.displayAddress}</span>
                </span>
                <span className="text-brand">+{Math.round(Number(trader.totalStaked) * 1000)} pts</span>
              </div>
            ))
          ) : (
            <p className="font-label text-sm text-muted-foreground">No traders yet</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
