import type { FixtureCandidate, FixtureDetail, OddsSnapshot } from "@/lib/api/fixtures";
import type { MarketView } from "@/lib/proxa/market-view";
import {
  formatSportsMarketName,
  formatSportsSelection,
  rawMarketParameters,
  rawSuperOddsType,
} from "@/lib/proxa/sports-market-labels";

function latestOddsLabels(
  odds: OddsSnapshot[],
  marketKey: string | null | undefined,
  teams: { homeTeam: string; awayTeam: string },
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

function candidateMarketName(candidate: FixtureCandidate): string {
  const marketType = rawSuperOddsType(candidate.raw) ?? candidate.marketType ?? candidate.statLabel;
  return formatSportsMarketName(marketType, rawMarketParameters(candidate.raw));
}

export function findFixtureForMarket(
  fixtures: FixtureDetail[],
  view: Pick<MarketView, "fixtureId">,
): FixtureDetail | undefined {
  return fixtures.find((fixture) => String(fixture.id) === view.fixtureId);
}

export function applyFixtureMarketMetadata(
  view: MarketView,
  fixture: FixtureDetail | undefined,
): MarketView {
  if (!fixture) return view;

  const linkedMarket = fixture.markets.find((market) => String(market.id) === view.id);
  const candidate = fixture.candidates.find((item) => {
    if (item.onChainMarketId === Number(view.id)) return true;
    return Boolean(linkedMarket?.externalMarketId && item.sourceMarketId === linkedMarket.externalMarketId);
  });

  const teams = { homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam };
  const marketKey = candidate?.sourceMarketId ?? linkedMarket?.externalMarketId;
  const oddsLabels = latestOddsLabels(fixture.odds, marketKey, teams);
  const marketName = candidate
    ? candidateMarketName(candidate)
    : linkedMarket?.statLabel
      ? formatSportsMarketName(linkedMarket.statLabel)
      : view.statLabel;

  return {
    ...view,
    title: `${fixture.homeTeam} vs ${fixture.awayTeam} - ${marketName}`,
    statLabel: marketName,
    bucketLabels: oddsLabels.length === view.numBuckets ? oddsLabels : view.bucketLabels,
  };
}
