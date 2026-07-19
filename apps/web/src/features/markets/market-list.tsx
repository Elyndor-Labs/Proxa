"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CandidateMarketCard } from "@/components/domain/candidate-market-card";
import { MarketCard } from "@/components/domain/market-card";
import { FilterTabs } from "@/components/layout/filter-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useFixtures } from "@/hooks/use-fixtures";
import { useMarkets } from "@/hooks/use-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { FixtureDetail } from "@/lib/api/fixtures";
import { getOutcomeQuotes } from "@/lib/format/odds";
import { filterMarkets, type MarketStatusFilter } from "@/lib/proxa/filters";
import { cn } from "@/lib/utils";

const STAGGER = ["animate-slide-up-delay-1", "animate-slide-up-delay-2", "animate-slide-up-delay-3", "animate-slide-up-delay-4"] as const;

const STATUS_TABS = [
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
  { label: "Voided", value: "voided" },
  { label: "All", value: "all" },
];

interface TxOddsCandidateSectionProps {
  fixtures: FixtureDetail[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

interface MarketFiltersProps {
  initialQuery: string;
  data: NonNullable<ReturnType<typeof useMarkets>["data"]>;
}

function TxOddsCandidateSection({ fixtures, isLoading, isError, error }: TxOddsCandidateSectionProps) {
  const candidates = useMemo(() => {
    return fixtures
      .flatMap((fixture) =>
        fixture.candidates.map((candidate) => ({
          fixture,
          candidate,
          odds: fixture.odds.filter((odd) => odd.marketKey === candidate.sourceMarketId),
        })),
      )
      .slice(0, 6);
  }, [fixtures]);

  if (isLoading) {
    return (
      <section className="mt-10 space-y-4">
        <div className="h-7 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface h-64 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mt-10 surface border-destructive/30 p-6">
        <p className="font-display font-semibold text-destructive">Failed to load TXOdds candidates</p>
        <p className="mt-1 text-sm text-muted-foreground">{getApiErrorMessage(error)}</p>
      </section>
    );
  }

  if (!candidates.length) return null;

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Upcoming from TXOdds</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Synced candidates waiting for review and on-chain launch.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="#launched-markets">View launched markets</a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {candidates.map(({ fixture, candidate, odds }) => (
          <CandidateMarketCard
            key={candidate.id}
            candidate={candidate}
            fixture={fixture}
            odds={odds}
          />
        ))}
      </div>
    </section>
  );
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
    <div id="launched-markets">
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
                account={record.account}
                outcomes={getOutcomeQuotes(record.account, view.bucketLabels)}
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
  const fixturesQuery = useFixtures();

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
      {data ? (
        <MarketFilters
          key={urlQuery}
          initialQuery={urlQuery}
          data={data}
        />
      ) : null}
      <TxOddsCandidateSection
        fixtures={fixturesQuery.data ?? []}
        isLoading={fixturesQuery.isLoading}
        isError={fixturesQuery.isError}
        error={fixturesQuery.error}
      />
    </>
  );
}
