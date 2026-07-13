"use client";

import Link from "next/link";
import { Activity, CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { CandidateMarketCard } from "@/components/domain/candidate-market-card";
import { MarketCard } from "@/components/domain/market-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFixture } from "@/hooks/use-fixture";
import { useFixtureMarkets } from "@/hooks/use-fixture-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { OddsSnapshot } from "@/lib/api/fixtures";
import { formatOdds } from "@/lib/format/odds";

interface FixtureMarketsViewProps {
  fixtureId: string;
}

function formatKickoff(startsAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startsAt));
}

function FixtureSkeleton() {
  return (
    <>
      <div className="surface h-32 animate-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="surface h-64 animate-pulse rounded-2xl" />
        ))}
      </div>
    </>
  );
}

/** All markets and candidate markets for a single fixture. */
export function FixtureMarketsView({ fixtureId }: FixtureMarketsViewProps) {
  const fixtureQuery = useFixture(fixtureId);
  const marketQuery = useFixtureMarkets(fixtureId);
  const fixture = fixtureQuery.data;

  const oddsByMarket = useMemo(() => {
    const grouped = new Map<string, OddsSnapshot[]>();
    for (const odd of fixture?.odds ?? []) {
      const values = grouped.get(odd.marketKey) ?? [];
      values.push(odd);
      grouped.set(odd.marketKey, values);
    }
    return grouped;
  }, [fixture?.odds]);

  if (fixtureQuery.isLoading || marketQuery.isLoading) {
    return <FixtureSkeleton />;
  }

  if (fixtureQuery.isError && marketQuery.isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Unable to load fixture</CardTitle>
          <CardDescription>{getApiErrorMessage(fixtureQuery.error ?? marketQuery.error)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/markets">Back to markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const launchedMarkets = marketQuery.data ?? [];
  const candidates = fixture?.candidates ?? [];

  if (!fixture && !launchedMarkets.length) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Fixture not found</CardTitle>
          <CardDescription>No fixture data or launched markets exist for fixture #{fixtureId}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/markets">Back to markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={fixture ? `${fixture.homeTeam} vs ${fixture.awayTeam}` : `Fixture #${fixtureId}`}
        description={
          fixture
            ? `${fixture.league} · ${fixture.status} · ${formatKickoff(fixture.startsAt)}`
            : `${launchedMarkets.length} launched market${launchedMarkets.length === 1 ? "" : "s"} on this fixture.`
        }
      />

      {fixtureQuery.isError && (
        <div className="surface border-destructive/30 p-4">
          <p className="font-display text-sm font-semibold text-destructive">
            Could not load TXOdds fixture metadata
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{getApiErrorMessage(fixtureQuery.error)}</p>
        </div>
      )}

      {fixture && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Candidate markets</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Synced from TXOdds and ready for review before launching on-chain.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <span>Last sync {fixture.lastSyncedAt ? formatKickoff(fixture.lastSyncedAt) : "not recorded"}</span>
            </div>
          </div>

          {candidates.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {candidates.map((candidate) => (
                <CandidateMarketCard
                  key={candidate.id}
                  candidate={candidate}
                  fixture={fixture}
                  odds={oddsByMarket.get(candidate.sourceMarketId ?? "") ?? []}
                />
              ))}
            </div>
          ) : (
            <div className="surface p-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold">No candidate markets yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sync TXOdds odds for this fixture to generate reviewable candidates.
              </p>
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold">Launched markets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            On-chain markets that users can trade or inspect.
          </p>
        </div>

        {launchedMarkets.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {launchedMarkets.map(({ record, view }) => (
              <MarketCard
                key={view.id}
                view={view}
                odds={Array.from({ length: view.numBuckets }, (_, i) => formatOdds(record.account, i))}
              />
            ))}
          </div>
        ) : (
          <div className="surface p-8 text-center">
            <p className="font-display text-lg font-bold">No launched markets</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Approve a candidate and create the Solana market before it appears here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
