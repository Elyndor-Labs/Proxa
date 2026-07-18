"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Banknote } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BN } from "@coral-xyz/anchor";
import { ClaimButton } from "@/components/domain/claim-button";
import { EntityAvatar } from "@/components/domain/entity-avatar";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";

/** Claimable payouts — payout total is visually dominant over position count. */
export function WithdrawView() {
  const { data: enriched, isLoading, isError, error } = useEnrichedPositions();

  const claimablePositions = useMemo(
    () => enriched?.filter(({ claimable }) => !claimable.isZero()) ?? [],
    [enriched],
  );

  const totalClaimable = useMemo(
    () =>
      claimablePositions.reduce(
        (sum, { claimable }) => sum.add(claimable),
        new BN(0),
      ),
    [claimablePositions],
  );

  const totalClaimableNum = Number(formatStake(totalClaimable));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-[var(--radius-card)]" />
          <Skeleton className="h-28 rounded-[var(--radius-card)]" />
        </div>
        <Skeleton className="h-48 rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="surface border-destructive/30 p-6">
        <p className="type-subheading text-base text-destructive">Failed to load claimable payouts</p>
        <p className="mt-1 text-sm text-text-secondary">{getApiErrorMessage(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Withdraw" }]} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-tile">
          <p className="section-label">Claimable Positions</p>
          <p className="stat-tile__value mt-3 text-[var(--text-xl)]">{claimablePositions.length}</p>
        </div>
        <div className="stat-tile stat-tile--featured">
          <p className="section-label inline-flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5" aria-hidden />
            Estimated Claimable Payout
          </p>
          <p className="stat-tile__value stat-tile__value--hero mt-2">
            $<AnimatedNumber value={totalClaimableNum} />
          </p>
        </div>
      </div>

      <div>
        <p className="section-label mb-4">Positions ready to claim</p>

        {!claimablePositions.length ? (
          <EmptyState
            compact
            illustration="payout"
            title="No claimable payouts"
            description="Resolved winning positions will appear here once markets settle."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/portfolio">View portfolio</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {claimablePositions.map(({ position, marketId, claimable, view: marketView }) => (
              <div key={position.address.toBase58()} className="surface surface-interactive p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <EntityAvatar
                      fixtureId={marketView.fixtureId}
                      statLabel={marketView.statLabel}
                      size="sm"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold tracking-tight">
                          {marketView.title}
                        </h3>
                        <SettlementBadge status={marketView.status} />
                      </div>
                      <p className="type-caption">
                        {marketView.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`}
                        <span aria-hidden> · </span>
                        Payout{" "}
                        <span className="font-semibold text-brand">
                          ${formatStake(claimable)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ClaimButton marketId={marketId} bucket={position.account.bucket} claimable={claimable} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
