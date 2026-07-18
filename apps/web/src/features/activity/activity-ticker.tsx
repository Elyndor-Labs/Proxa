"use client";

import Link from "next/link";
import { Activity, TrendingUp } from "lucide-react";
import { useActivityFeed } from "@/hooks/use-activity-feed";
import { cn } from "@/lib/utils";

/** Auto-scrolling trade activity ticker — mentioned.market style. */
export function ActivityTicker() {
  const items = useActivityFeed();
  // Triple so short feeds still scroll seamlessly (translateX -33.333%).
  const looped = items.length ? [...items, ...items, ...items] : [];

  if (!looped.length) return null;

  return (
    <div className="activity-ticker" aria-label="Recent platform activity">
      <div className="activity-ticker__label">
        <Activity className="h-3.5 w-3.5" aria-hidden />
        <span>Live</span>
      </div>
      <div className="activity-ticker__track">
        <div className="activity-ticker__marquee">
          {looped.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/markets/${item.marketId}`}
              className="activity-ticker__item"
            >
              <span className="activity-ticker__trader">{item.trader}</span>
              <span className="activity-ticker__action">
                {item.action}{" "}
                <strong className={item.side === "YES" ? "text-positive" : "text-negative"}>
                  {item.side}
                </strong>{" "}
                {item.amount}
              </span>
              <span className="activity-ticker__dot" aria-hidden>·</span>
              <span className="activity-ticker__market">{item.marketTitle}</span>
              <span className="activity-ticker__dot" aria-hidden>·</span>
              <span className="activity-ticker__ago">{item.ago}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="activity-ticker__pulse" aria-hidden>
        <TrendingUp className="h-3 w-3" />
      </div>
    </div>
  );
}

/** Static skeleton while markets load. */
export function ActivityTickerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("activity-ticker activity-ticker--loading", className)}>
      <div className="activity-ticker__label">
        <Activity className="h-3.5 w-3.5 opacity-50" />
        <span>Live</span>
      </div>
      <div className="skeleton h-4 flex-1 rounded" />
    </div>
  );
}
