"use client";

import Link from "next/link";
import { MarketCard } from "@/components/domain/market-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFixtureMarkets } from "@/hooks/use-fixture-markets";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getOutcomeQuotes } from "@/lib/format/odds";

interface FixtureMarketsViewProps {
  fixtureId: string;
}

/** All markets for a single fixture. */
export function FixtureMarketsView({ fixtureId }: FixtureMarketsViewProps) {
  const { data, isLoading, isError, error } = useFixtureMarkets(fixtureId);

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Unable to load fixture</CardTitle>
          <CardDescription>{getApiErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/markets">Back to markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
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
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Markets", href: "/markets" },
          { label: `Fixture #${fixtureId}` },
        ]}
      />
      <PageHeader
        title={`Fixture #${fixtureId}`}
        description={`${data.length} market${data.length === 1 ? "" : "s"} on this fixture.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-fade">
        {data.map(({ record, view }) => (
          <MarketCard
            key={view.id}
            view={view}
            account={record.account}
            outcomes={getOutcomeQuotes(record.account, view.bucketLabels)}
          />
        ))}
      </div>
    </>
  );
}
