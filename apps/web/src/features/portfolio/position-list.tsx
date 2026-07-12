"use client";

import Link from "next/link";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatStake } from "@/lib/format/odds";

/** Lists wallet positions with stake, status, and claim actions. */
export function PositionList() {
  const { data: enriched, isLoading, isError, error } = useEnrichedPositions();

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Failed to load positions</CardTitle>
          <CardDescription>{getApiErrorMessage(error)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!enriched?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No positions yet</CardTitle>
          <CardDescription>Place a bet on a live market to see your portfolio here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="brand" asChild>
            <Link href="/markets">Browse Markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {enriched.map(({ position, marketId, claimable, view }) => (
        <Card key={position.address.toBase58()}>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{view.title}</CardTitle>
                <SettlementBadge status={view.status} />
              </div>
              <CardDescription>
                {view.bucketLabels[position.account.bucket] ?? `Bucket ${position.account.bucket + 1}`} · Stake $
                {formatStake(position.account.amount)}
              </CardDescription>
            </div>
            <ClaimButton marketId={marketId} bucket={position.account.bucket} claimable={claimable} />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/markets/${marketId}`}>View Market</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
