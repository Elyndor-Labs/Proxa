"use client";

import Link from "next/link";
import { MarketCard } from "@/components/domain/market-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFixtureMarkets } from "@/hooks/use-fixture-markets";
import { formatOdds } from "@/lib/format/odds";

interface FixtureMarketsViewProps {
  fixtureId: string;
}

/** All markets for a single fixture. */
export function FixtureMarketsView({ fixtureId }: FixtureMarketsViewProps) {
  const { data, isLoading, isError } = useFixtureMarkets(fixtureId);

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Fixture not found</CardTitle>
          <CardDescription>No markets exist for fixture #{fixtureId}.</CardDescription>
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
    <>
      <PageHeader
        title={`Fixture #${fixtureId}`}
        description={`${data.length} market${data.length === 1 ? "" : "s"} on this fixture.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map(({ record, view }) => (
          <MarketCard
            key={view.id}
            view={view}
            odds={Array.from({ length: view.numBuckets }, (_, i) => formatOdds(record.account, i))}
          />
        ))}
      </div>
    </>
  );
}
