"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { FixtureStatusBanner } from "@/components/domain/fixture-status-banner";
import { Badge } from "@/components/ui/badge";
import { BetPanel } from "@/features/markets/bet-panel";
import { MarketPositionPanel } from "@/features/markets/market-position-panel";
import { OutcomeTradeTable } from "@/features/markets/word-trade-table";
import { useFixture } from "@/hooks/use-fixture";
import { useMarket } from "@/hooks/use-market";
import { useTimeRemaining } from "@/hooks/use-time-remaining";
import { getApiErrorMessage, isNotFoundError } from "@/lib/api/errors";
import type { FixtureCandidate, FixtureDetail, OddsSnapshot } from "@/lib/api/fixtures";
import { bucketChancePct } from "@/lib/format/odds";
import type { MarketView } from "@/lib/proxa/market-view";
import { formatSportsMarketName, formatSportsSelection } from "@/lib/proxa/sports-market-labels";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";
import { fixtureUnavailableMessage, isFixtureUnavailable } from "@/lib/proxa/fixture-status";
import type { MarketAccount } from "@proxa/sdk";

interface MarketDetailViewProps {
  marketId: string;
}

function PoolChart({ account, labels }: { account: MarketAccount; labels: string[] }) {
  return (
    <div className="surface p-5">
      <p className="section-label mb-4">Pool distribution</p>
      <div className="space-y-3">
        {labels.map((label, index) => {
          const pct = bucketChancePct(account, index);
          return (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between font-label text-sm">
                <span className="font-semibold">{label}</span>
                <span className="tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="progress-track h-2">
                <div
                  className="progress-fill progress-fill--gold h-full"
                  style={{ width: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function latestOddsLabels(
  odds: OddsSnapshot[],
  marketKey: string | null | undefined,
  teams?: { homeTeam: string; awayTeam: string },
): string[] {
  if (!marketKey) return [];

  const seen = new Set<string>();
  return odds
    .filter((odd) => odd.marketKey === marketKey)
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
    .filter((odd) => {
      if (seen.has(odd.selection)) return false;
      seen.add(odd.selection);
      return true;
    })
    .reverse()
    .map((odd) => formatSportsSelection(odd.selection, teams));
}

function rawMarketParameters(candidate?: FixtureCandidate): string | null {
  const raw = candidate?.raw;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = (raw as Record<string, unknown>).parameters;
  return typeof value === "string" ? value : null;
}

function buildDisplayView(view: MarketView, fixture: FixtureDetail | undefined, marketId: string): MarketView {
  if (!fixture) return view;

  const linkedMarket = fixture.markets.find((market) => String(market.id) === marketId);
  const candidate = fixture.candidates.find((item) => {
    if (item.onChainMarketId === Number(marketId)) return true;
    return Boolean(linkedMarket?.externalMarketId && item.sourceMarketId === linkedMarket.externalMarketId);
  });
  const marketKey = candidate?.sourceMarketId ?? linkedMarket?.externalMarketId;
  const teams = { homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam };
  const oddsLabels = latestOddsLabels(fixture.odds, marketKey, teams);
  const marketName = candidate
    ? formatSportsMarketName(candidate.marketType || candidate.statLabel, rawMarketParameters(candidate))
    : linkedMarket?.statLabel ?? view.statLabel;
  const title = `${fixture.homeTeam} vs ${fixture.awayTeam} - ${marketName}`;

  return {
    ...view,
    title: linkedMarket?.title ?? candidate?.title ?? title,
    statLabel: marketName,
    bucketLabels: oddsLabels.length === view.numBuckets ? oddsLabels : view.bucketLabels,
  };
}

/** Market detail layout with outcome table and trade sidebar. */
export function MarketDetailView({ marketId }: MarketDetailViewProps) {
  const { data, isLoading, isError, error } = useMarket(marketId, { subscribe: true });
  const betsCloseLabel = useTimeRemaining(data?.view.betsCloseTs ?? 0);
  const [selectedBucket, setSelectedBucket] = useState(0);
  const fixtureQuery = useFixture(data?.view.fixtureId ?? "");

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="surface h-96 animate-pulse rounded-2xl" />
        <div className="surface h-96 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    const notFound = isNotFoundError(error);
    return (
      <div className="surface mx-auto max-w-lg p-10 text-center">
        <p className="font-label text-sm text-muted-foreground">{notFound ? "404" : "Error"}</p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {notFound ? "Market not found" : "Unable to load market"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? `Market #${marketId} doesn't exist or may have been removed.`
            : getApiErrorMessage(error, "We couldn't load this market right now.")}
        </p>
        <Link href="/markets" className="trade-cta mt-6 inline-flex">
          Back to markets
        </Link>
      </div>
    );
  }

  const { account, view } = data;
  const displayView = buildDisplayView(view, fixtureQuery.data, marketId);
  const fixtureLabel = fixtureQuery.data
    ? `${fixtureQuery.data.homeTeam} vs ${fixtureQuery.data.awayTeam}`
    : `Fixture #${displayView.fixtureId}`;
  const tokenLabel = formatStakeTokenLabel(account.stakeMint.toBase58());
  const fixtureStatus = fixtureQuery.data?.status;
  const fixtureUnavailable = isFixtureUnavailable(fixtureStatus);
  const tradingBlockedMessage =
    fixtureUnavailable && fixtureStatus ? fixtureUnavailableMessage(fixtureStatus) : undefined;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 font-label text-sm text-muted-foreground">
        <Link href="/markets" className="transition-colors hover:text-foreground">
          Markets
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Market</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SettlementBadge status={displayView.status} />
          <Badge variant="secondary">{tokenLabel}</Badge>
          <Link href={`/fixture/${view.fixtureId}`}>
            <Badge variant="muted" className="cursor-pointer hover:bg-muted/80">
              {fixtureLabel}
            </Badge>
          </Link>
        </div>
        <h1 className="page-title text-3xl sm:text-4xl">{displayView.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-label text-sm text-muted-foreground">
          <span>{displayView.totalPool} volume</span>
          <span aria-hidden>·</span>
          <span>{displayView.numBuckets} outcomes</span>
          <span aria-hidden>·</span>
          <span>
            Closes <span className="font-semibold text-foreground">{betsCloseLabel}</span>
          </span>
        </div>
      </header>

      {fixtureUnavailable && fixtureStatus ? (
        <div className="mb-6">
          <FixtureStatusBanner status={fixtureStatus} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-5">
          <PoolChart account={account} labels={displayView.bucketLabels} />
          <OutcomeTradeTable
            view={displayView}
            account={account}
            selectedBucket={selectedBucket}
            onSelectBucket={setSelectedBucket}
            disabled={!displayView.isOpen || Boolean(tradingBlockedMessage)}
          />
          <MarketPositionPanel marketId={marketId} account={account} />
        </div>

        {/* Trade sidebar */}
        <BetPanel
          marketId={marketId}
          view={displayView}
          account={account}
          selectedBucket={selectedBucket}
          onSelectBucket={setSelectedBucket}
          tradingBlockedMessage={tradingBlockedMessage}
        />
      </div>
    </div>
  );
}
