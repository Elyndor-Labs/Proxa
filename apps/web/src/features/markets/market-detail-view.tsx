"use client";

import Link from "next/link";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BetPanel } from "@/features/markets/bet-panel";
import { MarketPositionPanel } from "@/features/markets/market-position-panel";
import { useMarket } from "@/hooks/use-market";
import { formatOdds } from "@/lib/format/odds";

interface MarketDetailViewProps {
  marketId: string;
}

/** Market detail with live pool data and bet placement. */
export function MarketDetailView({ marketId }: MarketDetailViewProps) {
  const { data, isLoading, isError, error } = useMarket(marketId, { subscribe: true });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Market not found</CardTitle>
          <CardDescription>{error instanceof Error ? error.message : "Unable to load market"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/markets">Back to markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { account, view } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SettlementBadge status={view.status} />
            <Link href={`/fixture/${view.fixtureId}`}>
              <Badge variant="muted" className="hover:bg-muted/80">
                Fixture #{view.fixtureId}
              </Badge>
            </Link>
          </div>
          <h1 className="font-display text-3xl font-bold">{view.title}</h1>
          <p className="mt-2 text-muted-foreground">Closes in {view.betsCloseLabel}</p>
        </div>

        <MarketPositionPanel marketId={marketId} account={account} />

        <Card>
          <CardHeader>
            <CardTitle>Pool Distribution</CardTitle>
            <CardDescription>Total pool: {view.totalPool}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {view.bucketLabels.map((label, index) => {
              const pool = account.bucketPools[index];
              const total = account.totalPool;
              const pct = total.isZero() ? 0 : pool.muln(100).div(total).toNumber();

              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between font-label text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">
                      {view.bucketPools[index]} · {formatOdds(account, index)}x
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <BetPanel marketId={marketId} view={view} account={account} />
    </div>
  );
}
