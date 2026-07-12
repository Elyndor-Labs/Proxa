"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isApiEnabled, ONCHAIN_TX_DISABLED_MESSAGE } from "@/config/api";
import { useConfig } from "@/hooks/use-protocol-stats";
import { useCreateMarket } from "@/hooks/use-create-market";
import { useProxaClient } from "@/hooks/use-proxa-client";
import {
  PERIOD_OPTIONS,
  STAT_OPTIONS,
  type PeriodOption,
  type StatOption,
} from "@/lib/proxa/stat-options";

/** Form to create a new on-chain market (protocol authority only). */
export function CreateMarketForm() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { data: config } = useConfig();
  const { canTransact } = useProxaClient();
  const createMarket = useCreateMarket();

  const [fixtureId, setFixtureId] = useState("");
  const [stat, setStat] = useState<StatOption>(STAT_OPTIONS[0]);
  const [period, setPeriod] = useState<PeriodOption>(PERIOD_OPTIONS[0]);
  const [numBuckets, setNumBuckets] = useState<number>(2);
  const [betsCloseHours, setBetsCloseHours] = useState("1");
  const [resolveAfterHours, setResolveAfterHours] = useState("2");
  const [resolveDeadlineHours, setResolveDeadlineHours] = useState("3");

  const isAuthority =
    wallet?.publicKey && config?.authority && wallet.publicKey.equals(config.authority);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMarket.mutate(
      {
        fixtureId,
        stat,
        period,
        numBuckets,
        betsCloseHours: Number(betsCloseHours),
        resolveAfterHours: Number(resolveAfterHours),
        resolveDeadlineHours: Number(resolveDeadlineHours),
      },
      {
        onSuccess: ({ marketId }) => router.push(`/markets/${marketId}`),
      },
    );
  };

  return (
    <RequireWallet>
      <PageHeader
        title="Create Market"
        description="Define a new parametric prop. Only the protocol authority can create markets on-chain."
      />

      {!canTransact && isApiEnabled() && (
        <Card className="mb-6 border-brand/30">
          <CardHeader>
            <CardTitle className="text-base">Test mode</CardTitle>
            <CardDescription>{ONCHAIN_TX_DISABLED_MESSAGE}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isAuthority && config && (
        <Card className="mb-6 border-warning/30">
          <CardHeader>
            <CardTitle className="text-base">Authority required</CardTitle>
            <CardDescription>
              Your wallet is not the protocol authority. Market creation will fail unless you connect
              the authority wallet ({config.authority.toBase58().slice(0, 8)}…).
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Market Parameters</CardTitle>
          <CardDescription>All times are relative to now in hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Fixture ID">
              <Input
                required
                type="number"
                min="1"
                placeholder="17271370"
                value={fixtureId}
                onChange={(e) => setFixtureId(e.target.value)}
              />
            </Field>

            <Field label={`Buckets: ${numBuckets}`}>
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
                    B{i + 1}
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

            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" variant="brand" disabled={createMarket.isPending || !fixtureId || !canTransact}>
                {createMarket.isPending ? "Creating…" : "Create Market"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/markets">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
