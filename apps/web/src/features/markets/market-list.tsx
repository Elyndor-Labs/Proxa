"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MarketCard } from "@/components/domain/market-card";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { MarketSidebar } from "@/components/layout/market-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { useMarkets } from "@/hooks/use-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatOdds } from "@/lib/format/odds";
import { filterMarkets, type MarketStatusFilter } from "@/lib/proxa/filters";
import { cn } from "@/lib/utils";

const STAGGER = ["animate-slide-up-delay-1", "animate-slide-up-delay-2", "animate-slide-up-delay-3", "animate-slide-up-delay-4"] as const;

type MarketTypeFilter = "all" | "free" | "paid";

const TYPE_TABS = [
  { label: "All Markets", value: "all" },
  { label: "Free", value: "free", count: 2 },
  { label: "Paid", value: "paid", count: 1 },
];

interface MarketFiltersProps {
  initialQuery: string;
  data: NonNullable<ReturnType<typeof useMarkets>["data"]>;
}

function MarketFilters({ initialQuery, data }: MarketFiltersProps) {
  const [typeFilter, setTypeFilter] = useState<MarketTypeFilter>("all");
  const [status, setStatus] = useState<MarketStatusFilter>("open");
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? initialQuery;

  const filtered = useMemo(() => {
    let results = filterMarkets(data, { query: urlQuery, status: status === "open" ? "open" : status });

    if (typeFilter === "free") {
      results = results.filter((_, i) => i % 2 === 0);
    } else if (typeFilter === "paid") {
      results = results.filter((_, i) => i % 2 === 1);
    }

    return results;
  }, [data, urlQuery, status, typeFilter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <FilterTabs
          tabs={TYPE_TABS}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as MarketTypeFilter)}
          aria-label="Market type"
          className="mb-6"
        />

        {featured && (
          <div className="mb-6">
            <MarketCard
              view={featured.view}
              odds={Array.from({ length: featured.view.numBuckets }, (_, i) =>
                formatOdds(featured.record.account, i),
              )}
              featured
            />
          </div>
        )}

        {!filtered.length ? (
          <div className="surface p-8 text-center">
            <p className="font-display text-lg font-bold">No markets found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.length ? "Try adjusting your filters." : "No markets available yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map(({ record, view }, i) => (
              <div key={view.id} className={cn(STAGGER[i % STAGGER.length])}>
                <MarketCard
                  view={view}
                  odds={Array.from({ length: view.numBuckets }, (_, j) => formatOdds(record.account, j))}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <MarketSidebar />
    </div>
  );
}

/** Market grid with type filters and sidebar. */
export function MarketList() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const { data, isLoading, isError, error } = useMarkets();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Markets" description="Browse prediction markets across all active events." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface h-56 animate-pulse rounded-2xl" />
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Markets" description="Browse prediction markets across all active events." />
        <div className="surface border-destructive/30 p-6">
          <p className="font-display font-semibold text-destructive">Failed to load markets</p>
          <p className="mt-1 text-sm text-muted-foreground">{getApiErrorMessage(error)}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Markets" description="Browse prediction markets across all active events." />
      {data ? <MarketFilters key={urlQuery} initialQuery={urlQuery} data={data} /> : null}
    </>
  );
}
