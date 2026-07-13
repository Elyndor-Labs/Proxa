"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useCreateMarket } from "@/hooks/use-create-market";
import { useFixtures } from "@/hooks/use-fixtures";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { useConfig } from "@/hooks/use-protocol-stats";
import type { FixtureCandidate, FixtureDetail } from "@/lib/api/fixtures";
import {
  PERIOD_OPTIONS,
  STAT_OPTIONS,
  type PeriodOption,
  type StatOption,
} from "@/lib/proxa/stat-options";
import { formatSportsMarketName } from "@/lib/proxa/sports-market-labels";

/** Admin-only form to launch a reviewed market on-chain. */
export function CreateMarketForm() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { data: config } = useConfig();
  const fixturesQuery = useFixtures();
  const { canTransact } = useProxaClient();
  const createMarket = useCreateMarket();

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [fixtureId, setFixtureId] = useState("");
  const [stat, setStat] = useState<StatOption>(STAT_OPTIONS[0]);
  const [period, setPeriod] = useState<PeriodOption>(PERIOD_OPTIONS[0]);
  const [numBuckets, setNumBuckets] = useState<number>(2);
  const [betsCloseHours, setBetsCloseHours] = useState("1");
  const [resolveAfterHours, setResolveAfterHours] = useState("2");
  const [resolveDeadlineHours, setResolveDeadlineHours] = useState("3");
  const [seedPerOutcome, setSeedPerOutcome] = useState("0.25");

  const isAuthority =
    Boolean(wallet?.publicKey && config?.authority && wallet.publicKey.equals(config.authority));
  const candidates = (fixturesQuery.data ?? []).flatMap((fixture) =>
    fixture.candidates.map((candidate) => ({ fixture, candidate })),
  );
  const selectedCandidate = candidates.find((item) => item.candidate.id === selectedCandidateId);

  const selectCandidate = (fixture: FixtureDetail, candidate: FixtureCandidate) => {
    setSelectedCandidateId(candidate.id);
    setFixtureId(String(fixture.id));
    setNumBuckets(candidate.numBuckets);

    if (candidate.statKey != null) {
      const match = splitStatKey(candidate.statKey);
      if (match) {
        setStat(match.stat);
        setPeriod(match.period);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthority) return;

    createMarket.mutate(
      {
        fixtureId,
        stat,
        period,
        numBuckets,
        betsCloseHours: Number(betsCloseHours),
        resolveAfterHours: Number(resolveAfterHours),
        resolveDeadlineHours: Number(resolveDeadlineHours),
        seedPerOutcome,
      },
      {
        onSuccess: ({ marketId }) => router.push(`/markets/${marketId}`),
      },
    );
  };

  return (
    <RequireWallet>
      <PageHeader
        title="Admin Market Launch"
        description="Launch approved TXOdds markets on-chain with the protocol authority wallet."
      />

      {!config && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loading protocol config</CardTitle>
            <CardDescription>Checking the authority wallet before showing launch controls.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {config && !isAuthority && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="text-base">Admin wallet required</CardTitle>
            <CardDescription>
              Market creation is restricted to the protocol authority wallet (
              {config.authority.toBase58().slice(0, 8)}...). Connect that wallet to launch markets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/markets">Back to markets</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {config && isAuthority && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>TXOdds Candidates</CardTitle>
              <CardDescription>Select a synced market candidate before launching on-chain.</CardDescription>
            </CardHeader>
            <CardContent>
              {fixturesQuery.isLoading && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
                  ))}
                </div>
              )}

              {!fixturesQuery.isLoading && candidates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No TXOdds candidates are synced yet. Sync fixtures and odds from the admin API first.
                </p>
              )}

              {candidates.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {candidates.map(({ fixture, candidate }) => {
                    const selected = candidate.id === selectedCandidateId;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => selectCandidate(fixture, candidate)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          selected
                            ? "border-brand bg-brand/10"
                            : "border-border bg-card hover:border-brand/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-brand/15 px-2 py-0.5 font-label text-xs font-semibold uppercase text-brand">
                            {candidate.status}
                          </span>
                          {candidate.statKey == null && (
                            <span className="rounded-full bg-warning/15 px-2 py-0.5 font-label text-xs font-semibold uppercase text-warning">
                              Needs mapping
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 line-clamp-2 font-label text-base font-semibold">
                          {candidate.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {fixture.homeTeam} vs {fixture.awayTeam}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatSportsMarketName(candidate.marketType, rawMarketParameters(candidate))} ·{" "}
                          {candidate.numBuckets} outcomes
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Launch Parameters</CardTitle>
              <CardDescription>
                {selectedCandidate
                  ? selectedCandidate.candidate.title
                  : "Choose a candidate above, then confirm the on-chain parameters."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCandidate?.candidate.statKey == null && (
                <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                  This TXOdds candidate does not have a stat-key mapping yet. Confirm the stat and period manually
                  before launching, then link the created market to this candidate through the admin API.
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Field label="Fixture ID">
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="18237038"
                  value={fixtureId}
                  onChange={(e) => setFixtureId(e.target.value)}
                />
              </Field>

              <Field label={`Outcomes: ${numBuckets}`}>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={1}
                  value={numBuckets}
                  onChange={(e) => setNumBuckets(Number(e.target.value))}
                  className="w-full accent-brand"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.from({ length: numBuckets }, (_, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-border bg-muted px-2 py-0.5 font-label text-xs"
                    >
                      {bucketPreviewLabel(i, numBuckets, stat.label)}
                    </span>
                  ))}
                </div>
              </Field>

              <Field label="Stat">
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                  value={stat.value}
                  onChange={(e) => {
                    const found = STAT_OPTIONS.find((s) => s.value === Number(e.target.value));
                    if (found) setStat(found);
                  }}
                >
                  {STAT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Period">
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                  value={period.value}
                  onChange={(e) => {
                    const found = PERIOD_OPTIONS.find((p) => p.value === Number(e.target.value));
                    if (found) setPeriod(found);
                  }}
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Bets close (hours)">
                <Input
                  required
                  type="number"
                  min="1"
                  value={betsCloseHours}
                  onChange={(e) => setBetsCloseHours(e.target.value)}
                />
              </Field>

              <Field label="Resolve after (hours)">
                <Input
                  required
                  type="number"
                  min="1"
                  value={resolveAfterHours}
                  onChange={(e) => setResolveAfterHours(e.target.value)}
                />
              </Field>

              <Field label="Resolve deadline (hours)">
                <Input
                  required
                  type="number"
                  min="1"
                  value={resolveDeadlineHours}
                  onChange={(e) => setResolveDeadlineHours(e.target.value)}
                />
              </Field>

              <Field label="Seed per outcome (USDC)">
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={seedPerOutcome}
                  onChange={(e) => setSeedPerOutcome(e.target.value)}
                />
              </Field>

              <div className="flex gap-3 sm:col-span-2">
                <Button
                  type="submit"
                  variant="brand"
                  disabled={createMarket.isPending || !fixtureId || !canTransact || !isAuthority}
                >
                  {createMarket.isPending ? "Creating..." : "Launch market"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/markets">Cancel</Link>
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </RequireWallet>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 font-label text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function splitStatKey(statKey: number): { stat: StatOption; period: PeriodOption } | null {
  for (const period of PERIOD_OPTIONS) {
    const statValue = statKey - period.value;
    const stat = STAT_OPTIONS.find((option) => option.value === statValue);
    if (stat) return { stat, period };
  }
  return null;
}

function rawMarketParameters(candidate: FixtureCandidate): string | null {
  const raw = candidate.raw;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = (raw as Record<string, unknown>).parameters;
  return typeof value === "string" ? value : null;
}

function bucketPreviewLabel(index: number, numBuckets: number, statLabel: string): string {
  const unit = statLabel.toLowerCase();
  const suffix = unit.includes("corner")
    ? "corners"
    : unit.includes("yellow")
      ? "yellow cards"
      : unit.includes("red")
        ? "red cards"
        : unit.includes("goal")
          ? "goals"
          : "value";
  return index === numBuckets - 1 ? `${index}+ ${suffix}` : `${index} ${suffix}`;
}
