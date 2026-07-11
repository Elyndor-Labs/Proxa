"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { useLeaderboard } from "@/hooks/use-leaderboard";

/** Hall of Fame ranked by on-chain stake volume. */
export function LeaderboardView() {
  const { data, isLoading, isError } = useLeaderboard();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Hall of Fame" description="Top bettors by on-chain stake volume." />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </>
    );
  }

  if (isError || !data?.length) {
    return (
      <>
        <PageHeader title="Hall of Fame" description="Top bettors by on-chain stake volume." />
        <Card>
          <CardHeader>
            <CardTitle>No rankings yet</CardTitle>
            <CardDescription>Leaderboard populates once bettors place positions on-chain.</CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  const podium = data.slice(0, 3);

  return (
    <>
      <PageHeader title="Hall of Fame" description="Top bettors ranked by total USDC staked on-chain." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {podium.map((leader, index) => (
          <Card
            key={leader.address}
            className={index === 0 ? "border-brand/40 sm:order-2" : index === 1 ? "sm:order-1" : "sm:order-3"}
          >
            <CardHeader className="text-center">
              <Badge variant={index === 0 ? "brand" : "muted"}>#{index + 1}</Badge>
              <CardTitle className="font-mono text-sm">{leader.displayAddress}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-display text-2xl font-bold">${leader.totalStaked}</p>
              <p className="mt-1 font-label text-xs text-muted-foreground">
                {leader.positionCount} positions · ${leader.totalWinnings} claimable
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] font-label text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Bettor</th>
                <th className="pb-2 pr-4">Staked</th>
                <th className="pb-2">Claimable</th>
              </tr>
            </thead>
            <tbody>
              {data.map((leader, index) => (
                <tr key={leader.address} className="border-b border-border/50">
                  <td className="py-3 pr-4">{index + 1}</td>
                  <td className="py-3 pr-4 font-mono">{leader.displayAddress}</td>
                  <td className="py-3 pr-4">${leader.totalStaked}</td>
                  <td className="py-3">${leader.totalWinnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
