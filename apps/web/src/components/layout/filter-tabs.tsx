"use client";

import { cn } from "@/lib/utils";

export interface FilterTab {
  label: string;
  value: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

/** Pill-style tab filter used across markets, leaderboard, and portfolio. */
export function FilterTabs({ tabs, value, onChange, className, "aria-label": ariaLabel }: FilterTabsProps) {
  return (
    <div
      className={cn("inline-flex flex-wrap gap-1 rounded-full border border-border/60 bg-muted/30 p-1", className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 font-label text-sm transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted-foreground">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
