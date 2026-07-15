"use client";

import { quoteClaim } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { ClaimButton } from "@/components/domain/claim-button";
import { usePositions } from "@/hooks/use-positions";
import { toMarketView } from "@/lib/proxa/market-view";
import { formatStake } from "@/lib/format/odds";

interface MarketPositionPanelProps {
  marketId: string;
  account: MarketAccount;
}

/** Shows the connected wallet's position and claim action for this market. */
export function MarketPositionPanel({ marketId, account }: MarketPositionPanelProps) {
  const { data: positions } = usePositions();
  const view = toMarketView(account);

  const marketPositions = positions?.filter((p) => p.account.marketId.toString() === marketId) ?? [];
  if (!marketPositions.length) return null;

  return (
    <div className="surface p-5">
      <p className="section-label mb-3">
        {marketPositions.length === 1 ? "Your position" : "Your positions"}
      </p>
      <div className="space-y-3">
        {marketPositions.map((position) => {
          const claimable = quoteClaim(account, position.account);
          const bucketLabel =
            view.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`;

          return (
            <div
              key={position.address.toBase58()}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--surface-border)] bg-black/20 px-3 py-3"
            >
              <div>
                <p className="font-display text-base font-bold">{bucketLabel}</p>
                <p className="mt-0.5 font-label text-sm text-muted-foreground">
                  Stake{" "}
                  <span className="font-semibold text-foreground">
                    ${formatStake(position.account.amount)}
                  </span>
                </p>
              </div>
              <ClaimButton
                marketId={marketId}
                bucket={position.account.bucket}
                claimable={claimable}
                size="default"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
