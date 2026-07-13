import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { LiveCloseLabel } from "@/components/domain/live-close-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  view: MarketView;
  odds?: string[];
  variant?: "teaser" | "full";
  featured?: boolean;
  hot?: boolean;
}

/** Market card with gradient surfaces and interactive outcomes. */
export function MarketCard({ view, odds, variant = "full", featured, hot }: MarketCardProps) {
  const isHot = hot ?? view.isOpen;

  if (featured) {
    return (
      <article className="surface surface-interactive overflow-hidden">
        <div className="market-hero-bg relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <SettlementBadge status={view.status} />
            <Badge variant="muted" className="border border-[var(--surface-border)] bg-black/30">
              Featured
            </Badge>
          </div>
          <h2 className="mt-5 font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            {view.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-xs text-muted-foreground">
            <span>{view.numBuckets} buckets</span>
            <span aria-hidden>·</span>
            <span>{view.totalPool} pool</span>
            <span aria-hidden>·</span>
            <LiveCloseLabel targetMs={view.betsCloseTs} />
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
          {view.bucketLabels.map((label, index) => (
            <div key={label} className="outcome-row">
              <span className="font-label text-sm font-semibold">{label}</span>
              <div className="flex items-center gap-2 font-label text-sm font-bold tabular-nums">
                <span className="text-success">{odds?.[index]?.split(" ")[0] ?? "50¢"}</span>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-destructive/90">{odds?.[index]?.split(" ")[1] ?? "50¢"}</span>
              </div>
            </div>
          ))}
          <Button variant="brand" size="lg" className="mt-1 w-full font-semibold sm:col-span-2" asChild>
            <Link href={`/markets/${view.id}`}>
              Trade this market
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "surface surface-interactive flex flex-col",
        isHot && "border-[var(--surface-border-hover)]",
        variant === "teaser" && "max-w-lg",
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <SettlementBadge status={view.status} />
          {isHot && view.isOpen && (
            <span className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/15 px-3 py-1 font-label text-[11px] font-bold uppercase tracking-wide text-destructive">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
              Live
            </span>
          )}
        </div>

        <h3 className="mt-3 font-display text-base font-bold leading-snug">{view.title}</h3>
        <Link
          href={`/fixture/${view.fixtureId}`}
          className="mt-1 font-label text-xs text-muted-foreground transition-colors hover:text-brand"
        >
          Fixture #{view.fixtureId}
        </Link>

        {variant === "full" && (
          <div className="mt-4 space-y-1.5">
            {view.bucketLabels.slice(0, 4).map((label, index) => (
              <div key={label} className="flex items-center justify-between font-label text-xs">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-bold tabular-nums text-success">{odds?.[index] ?? "50¢"}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 font-label text-[11px] text-muted-foreground">
          <span>{view.numBuckets} buckets · {view.totalPool}</span>
          <LiveCloseLabel targetMs={view.betsCloseTs} />
        </div>
      </div>

      <div className="border-t border-[var(--surface-border)] p-4">
        <Button variant="secondary" className="w-full" asChild>
          <Link href={`/markets/${view.id}`}>View Market</Link>
        </Button>
      </div>
    </article>
  );
}
