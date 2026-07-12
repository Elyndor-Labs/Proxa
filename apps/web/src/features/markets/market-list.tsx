"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MarketCard } from "@/components/domain/market-card";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { useMarkets } from "@/hooks/use-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatOdds } from "@/lib/format/odds";
import { filterMarkets, type MarketStatusFilter } from "@/lib/proxa/filters";
import { cn } from "@/lib/utils";

const STAGGER = ["animate-slide-up-delay-1", "animate-slide-up-delay-2", "animate-slide-up-delay-3", "animate-slide-up-delay-4"] as const;

const STATUS_TABS = [
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
  { label: "Voided", value: "voided" },
  { label: "All", value: "all" },
];

interface MarketFiltersProps {
  initialQuery: string;
  data: NonNullable<ReturnType<typeof useMarkets>["data"]>;
}

function MarketFilters({ initialQuery, data }: MarketFiltersProps) {
  const [status, setStatus] = useState<MarketStatusFilter>("open");
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? initialQuery;

  const filtered = useMemo(() => {
    return filterMarkets(data, { query: urlQuery, status });
  }, [data, urlQuery, status]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <FilterTabs
        tabs={STATUS_TABS}
        value={status}
        onChange={(v) => setStatus(v as MarketStatusFilter)}
        aria-label="Market status"
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
  );
}

/** Market grid with status filters. */
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
