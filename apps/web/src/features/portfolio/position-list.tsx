"use client";

import Link from "next/link";
import { BN } from "@coral-xyz/anchor";
import { quoteClaim } from "@proxa/sdk";
import { useQuery } from "@tanstack/react-query";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { ClaimButton } from "@/components/domain/claim-button";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePositions } from "@/hooks/use-positions";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { formatStake } from "@/lib/format/odds";
import { toMarketView } from "@/lib/proxa/market-view";
import { queryKeys } from "@/lib/proxa/query-keys";

/** Lists wallet positions with stake, status, and claim actions. */
export function PositionList() {
  const { data: positions, isLoading, isError } = usePositions();
  const { client } = useProxaClient();
  const wallet = useAnchorWallet();
  const owner = wallet?.publicKey?.toBase58();

  const enriched = useQuery({
    queryKey: queryKeys.positionsEnriched(owner ?? ""),
    queryFn: async () => {
      if (!positions?.length) return [];

      return Promise.all(
        positions.map(async (position) => {
          const marketId = position.account.marketId.toString();
          const market = await client.fetchMarket(new BN(marketId));
          const claimable = quoteClaim(market, position.account);
          return {
            position,
            market,
            marketId,
            claimable,
            view: toMarketView(market),
          };
        }),
      );
    },
    enabled: Boolean(positions?.length && owner),
  });

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Failed to load positions</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!positions?.length) {
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

  if (enriched.isLoading) {
    return (
      <div className="space-y-4">
        {positions.map((position) => (
          <div key={position.address.toBase58()} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (enriched.isError) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Failed to load position details</CardTitle>
          <CardDescription>
            {enriched.error instanceof Error ? enriched.error.message : "Unknown error"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {enriched.data?.map(({ position, marketId, claimable, view }) => (
        <Card key={position.address.toBase58()}>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{view.title}</CardTitle>
                <SettlementBadge status={view.status} />
              </div>
              <CardDescription>
                Bucket {view.bucketLabels[position.account.bucket] ?? position.account.bucket + 1} · Stake $
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
