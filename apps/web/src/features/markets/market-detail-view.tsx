"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Badge } from "@/components/ui/badge";
import { BetPanel } from "@/features/markets/bet-panel";
import { MarketPositionPanel } from "@/features/markets/market-position-panel";
import { WordTradeTable } from "@/features/markets/word-trade-table";
import { useMarket } from "@/hooks/use-market";
import { useTimeRemaining } from "@/hooks/use-time-remaining";
import { getApiErrorMessage, isNotFoundError } from "@/lib/api/errors";
import { bucketChancePct } from "@/lib/format/odds";
import type { MarketAccount } from "@proxa/sdk";

interface MarketDetailViewProps {
  marketId: string;
}

function PoolChart({ account, labels }: { account: MarketAccount; labels: string[] }) {
  return (
    <div className="surface p-5">
      <p className="section-label mb-4">Pool distribution</p>
      <div className="space-y-3">
        {labels.map((label, index) => {
          const pct = bucketChancePct(account, index);
          return (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between font-label text-sm">
                <span className="font-semibold">{label}</span>
                <span className="tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="progress-track h-2">
                <div
                  className="progress-fill progress-fill--gold h-full"
                  style={{ width: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Market detail — mentioned.market layout with words table and trade sidebar. */
export function MarketDetailView({ marketId }: MarketDetailViewProps) {
  const { data, isLoading, isError, error } = useMarket(marketId, { subscribe: true });
  const betsCloseLabel = useTimeRemaining(data?.view.betsCloseTs ?? 0);
  const [selectedBucket, setSelectedBucket] = useState(0);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="surface h-96 animate-pulse rounded-2xl" />
        <div className="surface h-96 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    const notFound = isNotFoundError(error);
    return (
      <div className="surface mx-auto max-w-lg p-10 text-center">
        <p className="font-label text-sm text-muted-foreground">{notFound ? "404" : "Error"}</p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {notFound ? "Market not found" : "Unable to load market"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? `Market #${marketId} doesn't exist or may have been removed.`
            : getApiErrorMessage(error, "We couldn't load this market right now.")}
        </p>
        <Link href="/markets" className="trade-cta mt-6 inline-flex">
          Back to markets
        </Link>
      </div>
    );
  }

  const { account, view } = data;
  const isFree = Number(view.id) % 2 === 1;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 font-label text-sm text-muted-foreground">
        <Link href="/markets" className="transition-colors hover:text-foreground">
          Markets
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{isFree ? "Free Market" : "Paid Market"}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SettlementBadge status={view.status} />
          <Badge variant={isFree ? "brand" : "secondary"}>{isFree ? "FREE" : "PAID"}</Badge>
          <Link href={`/fixture/${view.fixtureId}`}>
            <Badge variant="muted" className="cursor-pointer hover:bg-muted/80">
              Fixture #{view.fixtureId}
            </Badge>
          </Link>
        </div>
        <h1 className="page-title text-3xl sm:text-4xl">{view.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-label text-sm text-muted-foreground">
          <span>{view.totalPool} volume</span>
          <span aria-hidden>·</span>
          <span>{view.numBuckets} words</span>
          <span aria-hidden>·</span>
          <span>
            Closes <span className="font-semibold text-foreground">{betsCloseLabel}</span>
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-5">
          <PoolChart account={account} labels={view.bucketLabels} />
          <WordTradeTable
            view={view}
            account={account}
            selectedBucket={selectedBucket}
            onSelectBucket={setSelectedBucket}
            disabled={!view.isOpen}
          />
          <MarketPositionPanel marketId={marketId} account={account} />
        </div>

        {/* Trade sidebar */}
        <BetPanel
          marketId={marketId}
          view={view}
          account={account}
          selectedBucket={selectedBucket}
          onSelectBucket={setSelectedBucket}
        />
      </div>
    </div>
  );
}
