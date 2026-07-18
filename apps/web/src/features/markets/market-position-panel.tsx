"use client";

import { quoteClaim } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { useState } from "react";
import { ClaimButton } from "@/components/domain/claim-button";
import { usePositions } from "@/hooks/use-positions";
import { bucketChancePct, formatOdds, formatStake } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";

interface MarketPositionPanelProps {
  marketId: string;
  account: MarketAccount;
  view: MarketView;
}

const PAGE_SIZE = 2;

/** Shows the connected wallet's position and claim action for this market. */
export function MarketPositionPanel({ marketId, account, view }: MarketPositionPanelProps) {
  const [page, setPage] = useState(0);
  const { data: positions } = usePositions();
  const tokenLabel = formatStakeTokenLabel(account.stakeMint.toBase58());

  const marketPositions = positions?.filter((p) => p.account.marketId.toString() === marketId) ?? [];
  const totalPages = Math.max(1, Math.ceil(marketPositions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const visiblePositions = marketPositions.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );
  if (!marketPositions.length) return null;

  return (
    <div className="surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="section-label">
          {marketPositions.length === 1 ? "Your position" : "Your positions"}
        </p>
        {marketPositions.length > PAGE_SIZE ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-[var(--surface-border)] px-3 py-1 font-label text-xs text-muted-foreground disabled:opacity-40"
              disabled={currentPage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              Previous
            </button>
            <span className="font-label text-xs text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <input
              type="range"
              min={1}
              max={totalPages}
              step={1}
              value={currentPage + 1}
              onChange={(event) => setPage(Number(event.target.value) - 1)}
              className="w-24 accent-brand"
              aria-label="Position page"
            />
            <button
              type="button"
              className="rounded-md border border-[var(--surface-border)] px-3 py-1 font-label text-xs text-muted-foreground disabled:opacity-40"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        {visiblePositions.map((position) => {
          const claimable = quoteClaim(account, position.account);
          const bucket = position.account.bucket;
          const bucketLabel =
            view.bucketLabels[bucket] ?? `Bucket ${bucket + 1}`;
          const side = view.numBuckets === 2 ? (bucket === 0 ? "Yes" : "No") : "Back";
          const claimableAmount = formatStake(claimable);

          return (
            <div
              key={position.address.toBase58()}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--surface-border)] bg-black/20 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold">{bucketLabel}</p>
                <div className="mt-3 grid gap-2 font-label text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                  <PositionMetric label="Side" value={side} />
                  <PositionMetric
                    label="Size"
                    value={`${formatStake(position.account.amount)} ${tokenLabel}`}
                  />
                  <PositionMetric label="Pool share" value={`${bucketChancePct(account, bucket)}%`} />
                  <PositionMetric label="Current odds" value={`${formatOdds(account, bucket)}x`} />
                  {claimable.gtn(0) ? (
                    <PositionMetric label="Claimable" value={`${claimableAmount} ${tokenLabel}`} />
                  ) : null}
                </div>
              </div>
              <ClaimButton
                marketId={marketId}
                bucket={bucket}
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

function PositionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p>{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}
