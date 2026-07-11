"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MarketCard } from "@/components/domain/market-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMarkets } from "@/hooks/use-markets";
import { formatOdds } from "@/lib/format/odds";
import { filterMarkets, type MarketStatusFilter } from "@/lib/proxa/filters";
import { uniqueFixtures } from "@/lib/proxa/stat-options";

const STATUS_FILTERS: { label: string; value: MarketStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Settled", value: "resolved" },
  { label: "Voided", value: "voided" },
];

/** On-chain market grid with search and status filters. */
export function MarketList() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<MarketStatusFilter>("all");

  const { data, isLoading, isError, error } = useMarkets();

  const filtered = useMemo(
    () => (data ? filterMarkets(data, { query, status }) : []),
    [data, query, status],
  );

  const fixtures = useMemo(
    () => (data ? uniqueFixtures(data.map((m) => m.view.fixtureId)) : []),
    [data],
  );

  if (isLoading) {
    return (
      <>
        <PageHeader title="Live Markets" description="Browse parametric props across all active feeds." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Live Markets" description="Browse parametric props across all active feeds." />
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Failed to load markets</CardTitle>
            <CardDescription>{error instanceof Error ? error.message : "Unknown error"}</CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Live Markets" description="Browse parametric props across all active feeds." />

      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search by market ID, fixture, or stat…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search markets"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              aria-pressed={status === f.value}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Badge variant={status === f.value ? "brand" : "outline"} className="cursor-pointer px-3 py-1">
                {f.label}
              </Badge>
            </button>
          ))}
        </div>

        {fixtures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fixtures.slice(0, 6).map((fixtureId) => (
              <Link key={fixtureId} href={`/fixture/${fixtureId}`}>
                <Badge variant="muted" className="cursor-pointer hover:bg-muted/80">
                  Fixture #{fixtureId}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!filtered.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No markets found</CardTitle>
            <CardDescription>
              {data?.length ? "Try adjusting your search or filters." : "No markets on-chain yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ record, view }) => (
            <MarketCard
              key={view.id}
              view={view}
              odds={Array.from({ length: view.numBuckets }, (_, i) => formatOdds(record.account, i))}
            />
          ))}
        </div>
      )}
    </>
  );
}
