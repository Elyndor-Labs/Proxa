"use client";

import { useState } from "react";
import Link from "next/link";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";

const VIEW_TABS = [
  { label: "Open Positions", value: "open" },
  { label: "History", value: "history" },
];

/** Lists wallet positions with stats grid — mentioned.market style. */
export function PositionList() {
  const [view, setView] = useState("open");
  const { data: enriched, isLoading, isError, error } = useEnrichedPositions();

  const openPositions = enriched?.filter(({ view: v }) => v.isOpen) ?? [];
  const historyPositions = enriched?.filter(({ view: v }) => !v.isOpen) ?? [];
  const displayed = view === "open" ? openPositions : historyPositions;

  const stats = {
    markets: new Set(enriched?.map((p) => p.marketId) ?? []).size,
    tokensSpent: enriched?.reduce((sum, p) => sum + Number(formatStake(p.position.account.amount)), 0) ?? 0,
    pointsEarned: Math.round((enriched?.length ?? 0) * 50),
    trades: enriched?.length ?? 0,
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Failed to load positions</CardTitle>
          <CardDescription>{getApiErrorMessage(error)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Markets", value: stats.markets },
          { label: "Tokens Spent", value: stats.tokensSpent },
          { label: "Points Earned", value: `+${stats.pointsEarned}`, highlight: true },
          { label: "Trades", value: stats.trades },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className={`mt-2 font-display text-2xl font-bold ${stat.highlight ? "text-success" : ""}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {view === "open" ? "Open Positions" : "Trade History"}
          </p>
          <FilterTabs tabs={VIEW_TABS} value={view} onChange={setView} aria-label="Position view" />
        </div>

        {!displayed.length ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {view === "open" ? "No open positions" : "No trade history"}
              </CardTitle>
              <CardDescription>
                {view === "open"
                  ? "Place a bet on a live market to see your portfolio here."
                  : "Resolved trades will appear here."}
              </CardDescription>
            </CardHeader>
            {view === "open" && (
              <CardContent className="text-center">
                <Button variant="brand" asChild>
                  <Link href="/markets">Browse markets</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {displayed.map(({ position, marketId, claimable, view: marketView }) => (
              <Card key={position.address.toBase58()}>
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{marketView.title}</CardTitle>
                      <SettlementBadge status={marketView.status} />
                    </div>
                    <CardDescription>
                      {marketView.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`} ·
                      Stake ${formatStake(position.account.amount)}
                    </CardDescription>
                  </div>
                  <ClaimButton marketId={marketId} bucket={position.account.bucket} claimable={claimable} />
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/markets/${marketId}`}>View Market</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
