"use client";

import Link from "next/link";
import { useMarkets } from "@/hooks/use-markets";
import { bucketPriceCents } from "@/lib/format/odds";
import type { MarketRecord } from "@proxa/sdk";
import type { MarketView } from "@/lib/proxa/market-view";

interface MarqueeItem {
  id: string;
  title: string;
  statusLabel: string;
  isLive: boolean;
  isFree: boolean;
  words: string[];
  pool: string;
}

function toMarqueeItem({ record, view }: { record: MarketRecord; view: MarketView }): MarqueeItem {
  const { account } = record;
  const isFree = Number(view.id) % 2 === 1;
  const words = view.bucketLabels.slice(0, 3).map((label, i) => {
    const cents = bucketPriceCents(account, i);
    return `${label} ${cents}¢`;
  });

  return {
    id: view.id,
    title: view.title,
    statusLabel: view.isOpen ? "LIVE" : view.status.toUpperCase(),
    isLive: view.isOpen,
    isFree,
    words,
    pool: view.totalPool,
  };
}

function MarqueeSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4">
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="h-5 w-full animate-pulse rounded bg-muted" />
      <div className="flex gap-1.5">
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

function MarketScrollCard({ market }: { market: MarqueeItem }) {
  return (
    <Link
      href={`/markets/${market.id}`}
      className="landing-market-card group flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-[0_8px_32px_-8px_rgba(74,222,128,0.25)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-wide ${
              market.isLive
                ? "bg-success/15 text-success"
                : market.isFree
                  ? "bg-brand/15 text-brand"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {market.isFree && market.isLive ? "FREE" : market.statusLabel}
          </span>
        </div>
        {market.isLive && (
          <span className="flex items-center gap-1 font-label text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Live
          </span>
        )}
      </div>
      <h3 className="font-display text-sm font-bold leading-snug transition-colors group-hover:text-brand">
        {market.title}
      </h3>
      {market.words.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {market.words.map((word) => (
            <span
              key={word}
              className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 font-label text-xs font-medium text-muted-foreground"
            >
              {word}
            </span>
          ))}
        </div>
      )}
      <p className="font-label text-xs font-medium text-muted-foreground">{market.pool} pool</p>
    </Link>
  );
}

/** Live market ticker — data from the markets API. */
export function MarketMarquee() {
  const { data, isLoading } = useMarkets();
  const items = (data ?? []).map(toMarqueeItem).slice(0, 12);
  const doubled = items.length > 0 ? [...items, ...items] : [];

  return (
    <div className="relative z-10 w-full border-b border-border/40 bg-background/40 py-3 backdrop-blur-md">
      <div className="animate-marquee flex gap-4 px-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <MarqueeSkeleton key={`sk-${i}`} />)}
        {!isLoading &&
          doubled.map((market, i) => (
            <MarketScrollCard key={`${market.id}-${i}`} market={market} />
          ))}
      </div>
    </div>
  );
}
