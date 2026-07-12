"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { Button } from "@/components/ui/button";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

const VIEW_TABS = [
  { label: "Open Positions", value: "open" },
  { label: "History", value: "history" },
];

const STAGGER = ["", "animate-slide-up-delay-1", "animate-slide-up-delay-2", "animate-slide-up-delay-3", "animate-slide-up-delay-4"] as const;

/** Portfolio positions with stat tiles and position list. */
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
    return <div className="surface h-64 animate-pulse rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="surface border-destructive/30 p-6">
        <p className="font-display font-semibold text-destructive">Failed to load positions</p>
        <p className="mt-1 text-sm text-muted-foreground">{getApiErrorMessage(error)}</p>
      </div>
    );
  }

  const statItems = [
    { label: "Markets", value: stats.markets, highlight: false },
    { label: "Tokens Spent", value: stats.tokensSpent, highlight: false },
    { label: "Points Earned", value: `+${stats.pointsEarned}`, highlight: true },
    { label: "Trades", value: stats.trades, highlight: false },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <div key={stat.label} className={cn("stat-tile", STAGGER[Math.min(i, 4)])}>
            <p className="section-label">{stat.label}</p>
            <p className={cn("stat-tile__value mt-3", stat.highlight && "stat-tile__value--highlight")}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <p className="section-label">{view === "open" ? "Open Positions" : "Trade History"}</p>
          <FilterTabs tabs={VIEW_TABS} value={view} onChange={setView} aria-label="Position view" />
        </div>

        {!displayed.length ? (
          <div className="surface p-10 text-center">
            <p className="font-display text-lg font-bold">
              {view === "open" ? "No open positions" : "No trade history"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {view === "open"
                ? "Place a bet on a live market to see your portfolio here."
                : "Resolved trades will appear here."}
            </p>
            {view === "open" && (
              <Button variant="brand" size="lg" className="mt-6" asChild>
                <Link href="/markets">
                  Browse markets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(({ position, marketId, claimable, view: marketView }) => (
              <div key={position.address.toBase58()} className="surface surface-interactive p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold">{marketView.title}</h3>
                      <SettlementBadge status={marketView.status} />
                    </div>
                    <p className="font-label text-sm text-muted-foreground">
                      {marketView.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`}
                      <span aria-hidden> · </span>
                      Stake{" "}
                      <span className="font-semibold text-foreground">
                        ${formatStake(position.account.amount)}
                      </span>
                    </p>
                  </div>
                  <ClaimButton marketId={marketId} bucket={position.account.bucket} claimable={claimable} />
                </div>
                <div className="mt-4 border-t border-[var(--surface-border)] pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/markets/${marketId}`}>View Market</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
