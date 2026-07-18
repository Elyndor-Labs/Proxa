"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MarketCard } from "@/components/domain/market-card";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useMarkets } from "@/hooks/use-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getOutcomeQuotes } from "@/lib/format/odds";
import { filterMarkets, type MarketStatusFilter } from "@/lib/proxa/filters";
import { SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
            account={featured.record.account}
            outcomes={getOutcomeQuotes(featured.record.account, featured.view.bucketLabels)}
            featured
          />
        </div>
      )}

      {!filtered.length ? (
        <EmptyState
          icon={SearchX}
          title="No markets found"
          description={
            data.length ? "Try adjusting your filters or search query." : "No markets available yet."
          }
        />
      ) : (
        <div className="market-list-grid stagger-fade">
          {rest.map(({ record, view }) => (
            <MarketCard
              key={view.id}
              view={view}
              account={record.account}
              outcomes={getOutcomeQuotes(record.account, view.bucketLabels)}
            />
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
            <Skeleton key={i} className="h-56 rounded-[var(--radius-card)]" />
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
