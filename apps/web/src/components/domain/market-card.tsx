import Link from "next/link";
import type { MarketAccount } from "@proxa/sdk";
import { Layers, TrendingUp } from "lucide-react";
import { OddsHistoryChart } from "@/components/charts/odds-history-chart";
import { LiveCloseLabel } from "@/components/domain/live-close-label";
import { MarketCategoryBanner } from "@/components/domain/market-category-banner";
import { OutcomeStackMarquee } from "@/components/domain/outcome-stack-marquee";
import { SegmentedCountdown } from "@/components/domain/segmented-countdown";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OutcomeQuote } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  view: MarketView;
  account?: MarketAccount;
  outcomes?: OutcomeQuote[];
  variant?: "teaser" | "full";
  featured?: boolean;
  hot?: boolean;
}

/** Market card — category banner art, aligned badges, outcome rows (Reference A). */
export function MarketCard({ view, account, outcomes, variant = "full", featured, hot }: MarketCardProps) {
  const isHot = hot ?? view.isOpen;
  const displayOutcomes = outcomes ?? [];
  const previewOutcomes = displayOutcomes.slice(0, featured ? 4 : 3);

  if (featured) {
    return (
      <article className="surface surface-interactive overflow-hidden">
        <MarketCategoryBanner
          fixtureId={view.fixtureId}
          statLabel={view.statLabel}
          size="lg"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SettlementBadge status={view.status} />
                  <Badge variant="outline" className="h-6 normal-case tracking-normal">
                    Featured
                  </Badge>
                </div>
                {isHot && view.isOpen && (
                  <span className="live-pill">
                    <span className="live-pill__dot" aria-hidden />
                    Live
                  </span>
                )}
              </div>
              <h2 className="type-subheading mt-4 max-w-2xl text-foreground">{view.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 type-caption">
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3 w-3" aria-hidden />
                  {view.numBuckets} buckets
                </span>
                <span aria-hidden className="text-text-tertiary">
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  {view.totalPool} pool
                </span>
              </div>
            </div>
            {view.isOpen && <SegmentedCountdown targetMs={view.betsCloseTs} compact />}
          </div>
        </MarketCategoryBanner>

        {account && (
          <div className="market-card-featured__chart">
            <OddsHistoryChart account={account} labels={view.bucketLabels} compact height={100} />
          </div>
        )}

        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <OutcomeStackMarquee outcomes={previewOutcomes} loops={3} />
          <Button variant="brand" size="lg" className="cta-primary w-full" asChild>
            <Link href={`/markets/${view.id}`}>Trade this market</Link>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "market-card-grid surface surface-interactive flex h-full min-h-[22rem] flex-col",
        isHot && view.isOpen && "surface--live",
        variant === "teaser" && "max-w-lg",
      )}
    >
      <MarketCategoryBanner fixtureId={view.fixtureId} statLabel={view.statLabel} size="sm" />

      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <SettlementBadge status={view.status} />
          {isHot && view.isOpen ? (
            <span className="live-pill">
              <span className="live-pill__dot" aria-hidden />
              Live
            </span>
          ) : (
            <span className="h-6" aria-hidden />
          )}
        </div>

        <h3 className="mt-3 font-display text-base font-semibold leading-snug tracking-tight">
          {view.title}
        </h3>
        <p className="mt-1 type-caption">Fixture #{view.fixtureId}</p>

        {variant === "full" && (
          <div className="market-card-outcomes mt-4">
            <OutcomeStackMarquee outcomes={previewOutcomes} compact loops={3} />
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 type-caption">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" aria-hidden />
            {view.totalPool}
          </span>
          <LiveCloseLabel targetMs={view.betsCloseTs} variant="segmented" compact />
        </div>
      </div>

      <div className="border-t border-[var(--surface-border)] p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/markets/${view.id}`}>View Market</Link>
        </Button>
      </div>
    </article>
  );
}
