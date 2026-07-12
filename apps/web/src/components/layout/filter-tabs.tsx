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

/** Pill-style tab filter with gradient active state. */
export function FilterTabs({ tabs, value, onChange, className, "aria-label": ariaLabel }: FilterTabsProps) {
  return (
    <div className={cn("filter-group", className)} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(tab.value)}
            className="filter-pill"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("ml-1.5 tabular-nums", !active && "text-muted-foreground")}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
