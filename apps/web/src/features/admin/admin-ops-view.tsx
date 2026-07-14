"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import {
  useAdminCandidates,
  useSyncFixtureOdds,
  useSyncFixtures,
  useUpdateCandidateStatus,
} from "@/hooks/use-admin-ops";
import { useFixtures } from "@/hooks/use-fixtures";
import { useConfig } from "@/hooks/use-protocol-stats";

type StatusFilter = "all" | "candidate" | "approved" | "published" | "rejected";

export function AdminOpsView() {
  const wallet = useAnchorWallet();
  const { data: config } = useConfig();
  const fixturesQuery = useFixtures();
  const [fixtureSearch, setFixtureSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("candidate");

  const syncFixtures = useSyncFixtures();
  const syncOdds = useSyncFixtureOdds();
  const updateStatus = useUpdateCandidateStatus();
  const candidatesQuery = useAdminCandidates(statusFilter === "all" ? undefined : statusFilter);

  const isAuthority =
    Boolean(wallet?.publicKey && config?.authority && wallet.publicKey.equals(config.authority));

  const filteredFixtures = useMemo(() => {
    const q = fixtureSearch.trim().toLowerCase();
    const fixtures = fixturesQuery.data ?? [];
    if (!q) return fixtures;
    return fixtures.filter((fixture) => {
      const haystack = [
        String(fixture.id),
        fixture.homeTeam,
        fixture.awayTeam,
        fixture.league,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [fixtureSearch, fixturesQuery.data]);

  return (
    <RequireWallet>
      <PageHeader
        title="Admin Operations"
        description="Sync TXOdds fixtures, review candidates, and prepare markets for on-chain launch."
        actions={
          <Button variant="outline" asChild>
            <Link href="/create">Launch market</Link>
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
              to run admin operations.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {config && isAuthority && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Sync TXOdds data</CardTitle>
              <CardDescription>
                Pull fixtures from TXOdds, then sync odds per fixture to create reviewable candidates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="brand"
                disabled={syncFixtures.isPending}
                onClick={() => syncFixtures.mutate()}
              >
                {syncFixtures.isPending ? "Syncing fixtures…" : "Sync fixtures"}
              </Button>

              <div className="space-y-2">
                <Input
                  placeholder="Search fixtures by team, league, or ID…"
                  value={fixtureSearch}
                  onChange={(e) => setFixtureSearch(e.target.value)}
                />
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {filteredFixtures.length === 0 && (
                    <p className="px-2 py-4 text-sm text-muted-foreground">
                      No fixtures match. Sync fixtures first.
                    </p>
                  )}
                  {filteredFixtures.map((fixture) => (
                    <div
                      key={fixture.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2"
                    >
                      <div>
                        <p className="font-label text-sm font-semibold">
                          {fixture.homeTeam} vs {fixture.awayTeam}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID {fixture.id} · {fixture.league} · {fixture.status}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={syncOdds.isPending}
                        onClick={() => syncOdds.mutate(fixture.id)}
                      >
                        Sync odds
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate queue</CardTitle>
              <CardDescription>Approve candidates before launching them on-chain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["all", "candidate", "approved", "published", "rejected"] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={statusFilter === status ? "brand" : "outline"}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  ),
                )}
              </div>

              {candidatesQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading candidates…</p>
              )}

              {!candidatesQuery.isLoading && (candidatesQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">
                  No candidates in this queue. Sync odds for a fixture to create candidates.
                </p>
              )}

              <div className="space-y-2">
                {(candidatesQuery.data ?? []).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-label text-sm font-semibold">{candidate.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Fixture {candidate.fixtureId} · {candidate.statLabel} ·{" "}
                          {candidate.numBuckets} outcomes · {candidate.status}
                        </p>
                        {candidate.statKey == null ? (
                          <p className="mt-1 text-xs text-warning">No stat-key mapping</p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            statKey {candidate.statKey}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.status === "candidate" && (
                          <>
                            <Button
                              size="sm"
                              variant="brand"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({ id: candidate.id, status: "approved" })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({ id: candidate.id, status: "rejected" })
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(candidate.status === "approved" || candidate.status === "candidate") &&
                          candidate.onChainMarketId == null && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/create?candidate=${candidate.id}`}>Launch</Link>
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </RequireWallet>
  );
}
