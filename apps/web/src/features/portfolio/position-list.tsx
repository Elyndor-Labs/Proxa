"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Button } from "@/components/ui/button";
import { useEnrichedPositions, type EnrichedPosition } from "@/hooks/use-enriched-positions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";
import { cn } from "@/lib/utils";

const STAGGER = [
  "",
  "animate-slide-up-delay-1",
  "animate-slide-up-delay-2",
  "animate-slide-up-delay-3",
  "animate-slide-up-delay-4",
] as const;

/** Portfolio positions with stat tiles and status-grouped position lists. */
export function PositionList() {
  const { data: enriched, isLoading, isError, error } = useEnrichedPositions();
  const positions = enriched ?? [];
  const openPositions = positions.filter(({ view }) => view.isOpen);
  const claimablePositions = positions.filter(({ claimable }) => claimable.gtn(0));
  const historyPositions = positions.filter(({ view }) => !view.isOpen);

  const stats = {
    markets: new Set(positions.map((p) => p.marketId)).size,
    tokensStaked: positions.reduce(
      (sum, p) => sum + Number(formatStake(p.position.account.amount)),
      0,
    ),
    trades: positions.length,
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
    { label: "Tokens Staked", value: stats.tokensStaked.toFixed(2), highlight: false },
    { label: "Trades", value: stats.trades, highlight: false },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="mb-5">
          <p className="section-label">Positions</p>
          <p className="mt-1 text-sm text-muted-foreground">Grouped by current status.</p>
        </div>

        {!positions.length ? (
          <div className="surface p-10 text-center">
            <p className="font-display text-lg font-bold">No positions</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Place a bet on a live market to see your portfolio here.
            </p>
            <Button variant="brand" size="lg" className="mt-6" asChild>
              <Link href="/markets">
                Browse markets
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <PositionSection title="Claimable" positions={claimablePositions} empty="No claimable positions." />
            <PositionSection title="Open Positions" positions={openPositions} empty="No open positions." />
            <PositionSection title="History" positions={historyPositions} empty="No settled history." />
          </div>
        )}
      </div>
    </div>
  );
}

function PositionSection({
  title,
  positions,
  empty,
}: {
  title: string;
  positions: EnrichedPosition[];
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="section-label">{title}</p>
        <span className="font-label text-xs text-muted-foreground">{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div className="surface p-4 text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="space-y-3">
          {positions.map(({ position, market, marketId, claimable, view: marketView }) => {
            const tokenLabel = formatStakeTokenLabel(market.stakeMint.toBase58());
            return (
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
                        {formatStake(position.account.amount)} {tokenLabel}
                      </span>
                    </p>
                  </div>
                  <ClaimButton
                    marketId={marketId}
                    bucket={position.account.bucket}
                    claimable={claimable}
                    tokenLabel={tokenLabel}
                  />
                </div>
                <div className="mt-4 border-t border-[var(--surface-border)] pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/markets/${marketId}`}>View Market</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
