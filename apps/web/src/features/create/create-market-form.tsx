"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FixturePicker } from "@/features/create/fixture-picker";
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
import {
  formatSportsMarketName,
  parseMarketLine,
  rawMarketParameters,
} from "@/lib/proxa/sports-market-labels";
import { countBucketBounds, overFromHalfLine, thresholdBucketBounds } from "@proxa/sdk";

const LAUNCHABLE_STATUSES = new Set(["candidate", "approved"]);
type BucketMode = "count" | "threshold";

/** Admin launch wizard: pick fixture + approved candidate, then create on-chain. */
export function CreateMarketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wallet = useAnchorWallet();
  const { data: config } = useConfig();
  const fixturesQuery = useFixtures();
  const { canTransact } = useProxaClient();
  const createMarket = useCreateMarket();

  const [fixtureSearch, setFixtureSearch] = useState("");
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fixtureIdOverride, setFixtureIdOverride] = useState("");
  const [stat, setStat] = useState<StatOption>(STAT_OPTIONS[0]);
  const [period, setPeriod] = useState<PeriodOption>(PERIOD_OPTIONS[0]);
  const [numBuckets, setNumBuckets] = useState<number>(2);
  const [bucketMode, setBucketMode] = useState<BucketMode>("count");
  const [overLine, setOverLine] = useState("2.5");
  const [betsCloseHours, setBetsCloseHours] = useState("1");
  const [resolveAfterHours, setResolveAfterHours] = useState("2");
  const [resolveDeadlineHours, setResolveDeadlineHours] = useState("3");
  const [seedPerOutcome, setSeedPerOutcome] = useState("0.25");

  const isAuthority =
    Boolean(wallet?.publicKey && config?.authority && wallet.publicKey.equals(config.authority));

  const fixtures = useMemo(() => fixturesQuery.data ?? [], [fixturesQuery.data]);
  const selectedFixture = fixtures.find((fixture) => fixture.id === selectedFixtureId) ?? null;

  const launchableCandidates = useMemo(
    () =>
      fixtures.flatMap((fixture) =>
        fixture.candidates
          .filter((candidate) => LAUNCHABLE_STATUSES.has(candidate.status))
          .filter((candidate) => candidate.onChainMarketId == null)
          .map((candidate) => ({ fixture, candidate })),
      ),
    [fixtures],
  );

  const fixtureCandidates = useMemo(
    () =>
      selectedFixture
        ? launchableCandidates.filter((item) => item.fixture.id === selectedFixture.id)
        : launchableCandidates,
    [launchableCandidates, selectedFixture],
  );

  const selectedEntry = launchableCandidates.find(
    (item) => item.candidate.id === selectedCandidateId,
  );

  const selectFixture = (fixture: FixtureDetail) => {
    setSelectedFixtureId(fixture.id);
    setFixtureIdOverride(String(fixture.id));
    setSelectedCandidateId(null);
  };

  const selectCandidate = useCallback((fixture: FixtureDetail, candidate: FixtureCandidate) => {
    setSelectedFixtureId(fixture.id);
    setSelectedCandidateId(candidate.id);
    setFixtureIdOverride(String(fixture.id));
    setNumBuckets(candidate.numBuckets);

    const line = parseMarketLine(rawMarketParameters(candidate.raw));
    if (candidate.numBuckets === 2 && line) {
      setBucketMode("threshold");
      setOverLine(line);
    } else {
      setBucketMode("count");
    }

    if (candidate.statKey != null) {
      const match = splitStatKey(candidate.statKey);
      if (match) {
        setStat(match.stat);
        setPeriod(match.period);
      }
    }
  }, []);

  useEffect(() => {
    const candidateId = searchParams.get("candidate");
    if (!candidateId || selectedCandidateId) return;
    const entry = launchableCandidates.find((item) => item.candidate.id === candidateId);
    if (entry) {
      // Candidate rows load asynchronously, so this syncs /create?candidate=... into the form once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      selectCandidate(entry.fixture, entry.candidate);
    }
  }, [searchParams, launchableCandidates, selectedCandidateId, selectCandidate]);

  const effectiveFixtureId = selectedFixtureId ?? (fixtureIdOverride ? Number(fixtureIdOverride) : null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthority || effectiveFixtureId == null) return;

    const bucketBounds =
      bucketMode === "threshold"
        ? thresholdBucketBounds(overFromHalfLine(Number(overLine)))
        : countBucketBounds(numBuckets);
    const resolvedBuckets = bucketMode === "threshold" ? 2 : numBuckets;

    createMarket.mutate(
      {
        fixtureId: String(effectiveFixtureId),
        stat,
        period,
        numBuckets: resolvedBuckets,
        bucketBounds,
        betsCloseHours: Number(betsCloseHours),
        resolveAfterHours: Number(resolveAfterHours),
        resolveDeadlineHours: Number(resolveDeadlineHours),
        seedPerOutcome,
        candidateId: selectedCandidateId ?? undefined,
      },
      {
        onSuccess: ({ marketId }) => router.push(`/markets/${marketId}`),
      },
    );
  };

  return (
    <RequireWallet>
      <PageHeader
        title="Launch Market"
        description="Pick a synced fixture and approved candidate, then deploy the market on-chain."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin">Admin ops</Link>
          </Button>
        }
      />

      {!config && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loading protocol config</CardTitle>
          </CardHeader>
        </Card>
      )}

      {config && !isAuthority && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="text-base">Authority wallet required</CardTitle>
            <CardDescription>
              Connect the protocol authority wallet ({config.authority.toBase58().slice(0, 8)}…)
              to launch markets.
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
              <CardTitle>1. Choose fixture</CardTitle>
              <CardDescription>
                Search synced TXOdds fixtures. No manual fixture ID entry required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixturePicker
                fixtures={fixtures}
                selectedFixtureId={selectedFixtureId}
                onSelect={selectFixture}
                search={fixtureSearch}
                onSearchChange={setFixtureSearch}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Choose candidate</CardTitle>
              <CardDescription>
                Approved or pending candidates ready for on-chain launch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fixturesQuery.isLoading && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
                  ))}
                </div>
              )}

              {!fixturesQuery.isLoading && fixtureCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No launchable candidates. Sync odds in{" "}
                  <Link href="/admin" className="text-brand underline">
                    Admin ops
                  </Link>{" "}
                  first.
                </p>
              )}

              {fixtureCandidates.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {fixtureCandidates.map(({ fixture, candidate }) => {
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
                          {formatSportsMarketName(candidate.marketType, rawMarketParameters(candidate.raw))} ·{" "}
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
              <CardTitle>3. Confirm launch</CardTitle>
              <CardDescription>
                {selectedEntry
                  ? selectedEntry.candidate.title
                  : "Select a fixture and candidate above."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntry?.candidate.statKey == null && (
                <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                  This candidate has no automatic stat-key mapping. Confirm stat and period
                  manually before launch.
                </div>
              )}

              {effectiveFixtureId != null && (
                <p className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  Fixture <span className="font-semibold">{effectiveFixtureId}</span>
                  {selectedFixture
                    ? ` · ${selectedFixture.homeTeam} vs ${selectedFixture.awayTeam}`
                    : ""}
                </p>
              )}

              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Bucket model">
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                    value={bucketMode}
                    onChange={(e) => {
                      const mode = e.target.value as BucketMode;
                      setBucketMode(mode);
                      if (mode === "threshold") setNumBuckets(2);
                    }}
                  >
                    <option value="count">Count (0, 1, 2, ...)</option>
                    <option value="threshold">Over / Under line</option>
                  </select>
                </Field>

                {bucketMode === "threshold" ? (
                  <Field label="Over line (e.g. 2.5)">
                    <Input
                      required
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={overLine}
                      onChange={(e) => setOverLine(e.target.value)}
                    />
                  </Field>
                ) : (
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
                  </Field>
                )}

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

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground underline"
                    onClick={() => setShowAdvanced((value) => !value)}
                  >
                    {showAdvanced ? "Hide advanced" : "Advanced options"}
                  </button>
                  {showAdvanced && (
                    <div className="mt-3">
                      <Field label="Fixture ID override">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Only if you need a manual override"
                          value={fixtureIdOverride}
                          onChange={(e) => setFixtureIdOverride(e.target.value)}
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 sm:col-span-2">
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={
                      createMarket.isPending ||
                      effectiveFixtureId == null ||
                      !canTransact ||
                      !isAuthority
                    }
                  >
                    {createMarket.isPending ? "Launching…" : "Launch market"}
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
  for (const periodOption of PERIOD_OPTIONS) {
    const statValue = statKey - periodOption.value;
    const statOption = STAT_OPTIONS.find((option) => option.value === statValue);
    if (statOption) return { stat: statOption, period: periodOption };
  }
  return null;
}
