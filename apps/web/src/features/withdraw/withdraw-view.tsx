"use client";

import Link from "next/link";
import { BN } from "@coral-xyz/anchor";
import { ArrowRight, WalletCards } from "lucide-react";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useClaimMany } from "@/hooks/use-claim";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";

/** Claimable payouts for resolved winning positions. */
export function WithdrawView() {
  const { data, isLoading, isError, error } = useEnrichedPositions();
  const claimMany = useClaimMany();
  const { canTransact } = useProxaClient();
  const claimable = (data ?? []).filter((position) => position.claimable.gtn(0));
  const total = claimable.reduce((sum, item) => sum.add(item.claimable), new BN(0));
  const tokenLabels = new Set(
    claimable.map((item) => formatStakeTokenLabel(item.market.stakeMint.toBase58())),
  );
  const totalTokenLabel = tokenLabels.size === 1 ? [...tokenLabels][0] : "stake token";
  const claimAll = () => {
    claimMany.mutate(
      claimable.map((item) => ({
        marketId: item.marketId,
        bucket: item.position.account.bucket,
      })),
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WithdrawHeader />
        <div className="surface h-64 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <WithdrawHeader />
        <div className="surface border-destructive/30 p-6">
          <p className="font-display font-semibold text-destructive">Failed to load withdrawals</p>
          <p className="mt-1 text-sm text-muted-foreground">{getApiErrorMessage(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WithdrawHeader />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-tile">
          <p className="section-label">Claimable positions</p>
          <p className="stat-tile__value mt-3">{claimable.length}</p>
        </div>
        <div className="stat-tile sm:col-span-2">
          <p className="section-label">Estimated claimable payout</p>
          <p className="stat-tile__value stat-tile__value--highlight mt-3">
            {formatStake(total)} {totalTokenLabel}
          </p>
        </div>
      </div>

      {!claimable.length ? (
        <div className="surface p-10 text-center">
          <WalletCards className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-bold">No claimable payouts</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Withdrawals appear here after a market resolves and your position is on the winning outcome.
          </p>
          <Button variant="brand" size="lg" className="mt-6" asChild>
            <Link href="/portfolio">
              View portfolio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-base font-bold">Ready to withdraw</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Claim {claimable.length} payout{claimable.length === 1 ? "" : "s"} to your wallet.
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              disabled={!canTransact || claimMany.isPending || claimable.length === 0}
              onClick={claimAll}
            >
              {claimMany.isPending ? "Claiming..." : `Claim all ${formatStake(total)} ${totalTokenLabel}`}
            </Button>
          </div>

          {claimable.map(({ position, market, marketId, claimable: amount, view }) => {
            const tokenLabel = formatStakeTokenLabel(market.stakeMint.toBase58());
            return (
              <div key={position.address.toBase58()} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold">{view.title}</h3>
                      <SettlementBadge status={view.status} />
                    </div>
                    <p className="font-label text-sm text-muted-foreground">
                      {view.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`}
                    </p>
                    <p className="font-label text-sm">
                      Claimable{" "}
                      <span className="font-semibold text-brand">
                        {formatStake(amount)} {tokenLabel}
                      </span>
                    </p>
                  </div>
                  <ClaimButton
                    marketId={marketId}
                    bucket={position.account.bucket}
                    claimable={amount}
                    tokenLabel={tokenLabel}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WithdrawHeader() {
  return (
    <div>
      <Breadcrumbs className="mb-4" items={[{ label: "Withdraw" }]} />
      <PageHeader
        title="Withdraw"
        description="Claim settled winnings from your resolved positions."
      />
    </div>
  );
}
