import { EntityAvatar } from "@/components/domain/entity-avatar";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface MarketHeroBackdropProps {
  view: MarketView;
  className?: string;
  children?: React.ReactNode;
}

/** Split-diagonal hero imagery — outcome-tinted halves with entity badges. */
export function MarketHeroBackdrop({ view, className, children }: MarketHeroBackdropProps) {
  const isBinary = view.numBuckets === 2;
  const leftLabel = view.bucketLabels[0] ?? "A";
  const rightLabel = view.bucketLabels[1] ?? view.bucketLabels[0] ?? "B";

  return (
    <div className={cn("market-hero-backdrop", className)}>
      <div className="market-hero-backdrop__split" aria-hidden>
        <div className="market-hero-backdrop__half market-hero-backdrop__half--left">
          <EntityAvatar fixtureId={view.fixtureId} statLabel={leftLabel} size="lg" />
          <span className="market-hero-backdrop__badge-label">{leftLabel}</span>
        </div>
        <div className="market-hero-backdrop__half market-hero-backdrop__half--right">
          <EntityAvatar
            fixtureId={`${view.fixtureId}-b`}
            statLabel={isBinary ? rightLabel : view.statLabel}
            size="lg"
          />
          {isBinary && (
            <span className="market-hero-backdrop__badge-label">{rightLabel}</span>
          )}
        </div>
        <div className="market-hero-backdrop__vs">vs</div>
      </div>
      <div className="market-hero-backdrop__overlay" aria-hidden />
      <div className="market-hero-backdrop__content">{children}</div>
    </div>
  );
}
