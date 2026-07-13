import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FixtureCandidate, FixtureDetail, OddsSnapshot } from "@/lib/api/fixtures";
import {
  formatProbability,
  formatSportsMarketName,
  formatSportsSelection,
  formatTxOddsPrice,
} from "@/lib/proxa/sports-market-labels";

interface CandidateMarketCardProps {
  candidate: FixtureCandidate;
  fixture: Pick<FixtureDetail, "homeTeam" | "awayTeam">;
  odds: OddsSnapshot[];
}

function rawMarketParameters(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || !("MarketParameters" in raw)) return null;
  const value = (raw as { MarketParameters?: unknown }).MarketParameters;
  return typeof value === "string" ? value : null;
}

export function CandidateMarketCard({ candidate, fixture, odds }: CandidateMarketCardProps) {
  const marketName = formatSportsMarketName(candidate.statLabel, rawMarketParameters(candidate.raw));
  const teams = { homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam };

  return (
    <article className="surface flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={candidate.status === "published" ? "success" : "muted"}>
            {candidate.status}
          </Badge>
          <Badge variant="outline">{candidate.source}</Badge>
        </div>

        <h3 className="mt-4 font-display text-base font-bold leading-snug">{marketName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {fixture.homeTeam} vs {fixture.awayTeam}
        </p>

        <div className="mt-4 space-y-2">
          {odds.length ? (
            odds.map((odd) => (
              <div
                key={odd.id}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[var(--surface-border)] bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="font-label text-sm font-semibold">
                    {formatSportsSelection(odd.selection, teams)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatProbability(odd.impliedProbability)}
                  </p>
                </div>
                <span className="font-label text-sm font-bold tabular-nums text-success">
                  {formatTxOddsPrice(odd.priceDecimal)}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--surface-border)] p-4 text-sm text-muted-foreground">
              No odds snapshot is stored for this candidate yet.
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
          <Database className="h-4 w-4" aria-hidden="true" />
          <span>{candidate.numBuckets} outcomes from TXOdds</span>
        </div>
      </div>

      <div className="border-t border-[var(--surface-border)] p-4">
        {candidate.onChainMarketId ? (
          <Button variant="secondary" className="w-full" asChild>
            <Link href={`/markets/${candidate.onChainMarketId}`}>
              View launched market
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            Awaiting market launch
          </Button>
        )}
      </div>
    </article>
  );
}
