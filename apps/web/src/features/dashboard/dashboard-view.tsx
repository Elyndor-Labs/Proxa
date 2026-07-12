"use client";

import Link from "next/link";
import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfig, useProtocolStats } from "@/hooks/use-protocol-stats";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { formatStake } from "@/lib/format/odds";
import { useMemo } from "react";

/** On-chain protocol overview with wallet performance summary. */
export function DashboardView() {
  const { data: stats, isLoading } = useProtocolStats();
  const { data: config } = useConfig();
  const { data: enriched, isLoading: portfolioLoading } = useEnrichedPositions();
  const wallet = useAnchorWallet();

  const portfolio = useMemo(() => {
    if (!enriched?.length) return { staked: new BN(0), claimable: new BN(0) };
    return enriched.reduce(
      (acc, { position, claimable }) => ({
        staked: acc.staked.add(position.account.amount),
        claimable: acc.claimable.add(claimable),
      }),
      { staked: new BN(0), claimable: new BN(0) },
    );
  }, [enriched]);

  if (isLoading || !stats) {
    return (
      <>
        <PageHeader title="Network Overview" description="Protocol-wide metrics and your performance." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </>
    );
  }

  const cards = [
    { label: "Total Value Locked", value: stats.totalTvl },
    { label: "Open Markets", value: String(stats.openMarkets) },
    { label: "Settled Markets", value: String(stats.resolvedMarkets) },
    { label: "Total Markets", value: String(stats.totalMarkets) },
  ];

  return (
    <>
      <PageHeader title="Network Overview" description="Protocol-wide metrics and your performance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-label text-xs font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>
              {wallet ? "Based on your connected wallet positions." : "Connect a wallet to see your stats."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {portfolioLoading ? (
              <div className="h-12 animate-pulse rounded-lg bg-muted" />
            ) : enriched?.length ? (
              <>
                <div className="flex justify-between font-label text-sm">
                  <span className="text-muted-foreground">Total staked</span>
                  <span className="font-medium">${formatStake(portfolio.staked)}</span>
                </div>
                <div className="flex justify-between font-label text-sm">
                  <span className="text-muted-foreground">Claimable</span>
                  <span className="font-medium text-brand">${formatStake(portfolio.claimable)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No positions yet.</p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/portfolio">View Portfolio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protocol Config</CardTitle>
            <CardDescription>On-chain program configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-label text-sm">
            {config ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span>{(config.feeBps / 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Markets created</span>
                  <span>{config.marketCount.toString()}</span>
                </div>
                <Badge variant="muted" className="mt-2">
                  {config.authority.toBase58().slice(0, 8)}… authority
                </Badge>
              </>
            ) : (
              <p className="text-muted-foreground">Loading config…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
