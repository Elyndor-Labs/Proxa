"use client";

import Link from "next/link";
import { createElement, useState } from "react";
import {
  Clock,
  Hash,
  Layers,
  TrendingUp,
} from "lucide-react";
import { marketCategoryIcon } from "@/lib/format/market-category";
import { SegmentedCountdown } from "@/components/domain/segmented-countdown";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { OddsHistoryChart } from "@/components/charts/odds-history-chart";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { BetPanel } from "@/features/markets/bet-panel";
import { MarketPositionPanel } from "@/features/markets/market-position-panel";
import { WordTradeTable } from "@/features/markets/word-trade-table";
import { useMarket } from "@/hooks/use-market";
import { getApiErrorMessage, isNotFoundError } from "@/lib/api/errors";

interface MarketDetailViewProps {
  marketId: string;
}

/** Market detail — breadcrumbs, odds chart, words table, trade sidebar. */
export function MarketDetailView({ marketId }: MarketDetailViewProps) {
  const { data, isLoading, isError, error } = useMarket(marketId, { subscribe: true });
  const [selectedBucket, setSelectedBucket] = useState(0);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="surface h-96 animate-pulse" />
        <div className="surface h-96 animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    const notFound = isNotFoundError(error);
    return (
      <div className="surface mx-auto max-w-lg p-10 text-center">
        <p className="font-label text-sm text-text-secondary">{notFound ? "404" : "Error"}</p>
        <h1 className="mt-2 type-heading">
          {notFound ? "Market not found" : "Unable to load market"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
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
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Markets", href: "/markets" },
          { label: isFree ? "Free Market" : "Paid Market" },
        ]}
      />

      <header className="mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="market-detail-icon" aria-hidden>
            {createElement(marketCategoryIcon(view.statLabel), {
              className: "h-6 w-6",
              strokeWidth: 1.5,
            })}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SettlementBadge status={view.status} />
              <Badge variant={isFree ? "brand" : "outline"}>{isFree ? "FREE" : "PAID"}</Badge>
              <Link href={`/fixture/${view.fixtureId}`}>
                <Badge variant="muted" className="cursor-pointer hover:bg-muted/80">
                  Fixture #{view.fixtureId}
                </Badge>
              </Link>
            </div>
            <h1 className="type-heading">{view.title}</h1>

            <div className="market-meta-row">
              <span className="market-meta-row__item">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                <strong>{view.totalPool}</strong> volume
              </span>
              <span className="market-meta-row__divider" aria-hidden />
              <span className="market-meta-row__item">
                <Layers className="h-3.5 w-3.5" aria-hidden />
                <strong>{view.numBuckets}</strong> outcomes
              </span>
              <span className="market-meta-row__divider" aria-hidden />
              <span className="market-meta-row__item">
                <Hash className="h-3.5 w-3.5" aria-hidden />
                Market <strong>#{view.id}</strong>
              </span>
              {view.isOpen && (
                <>
                  <span className="market-meta-row__divider" aria-hidden />
                  <span className="market-meta-row__item">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Closes in
                  </span>
                  <SegmentedCountdown targetMs={view.betsCloseTs} />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 stagger-fade">
          <div className="surface p-5">
            <p className="section-label mb-4">Odds history · 24h</p>
            <OddsHistoryChart account={account} labels={view.bucketLabels} />
          </div>

          <WordTradeTable
            view={view}
            account={account}
            selectedBucket={selectedBucket}
            onSelectBucket={setSelectedBucket}
            disabled={!view.isOpen}
          />

          <MarketPositionPanel marketId={marketId} account={account} />
        </div>

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
