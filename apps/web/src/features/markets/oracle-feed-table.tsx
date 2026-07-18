"use client";

import Link from "next/link";
import { Activity, Hash, Layers, TrendingUp } from "lucide-react";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarkets } from "@/hooks/use-markets";
import { isApiEnabled } from "@/config/api";

/** Market status feed — settlement state per market. */
export function OracleFeedTable() {
  const { data, isLoading } = useMarkets();

  if (isLoading) {
    return <div className="surface h-32 animate-pulse" />;
  }

  if (!data?.length) return null;

  const rows = data.slice(0, 10);
  const source = isApiEnabled() ? "API" : "on-chain";

  return (
    <Card className="rounded-[var(--radius-card)] border-[var(--surface-border)] bg-transparent shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="type-subheading text-base">Market Settlement Feed</CardTitle>
        <CardDescription>
          {source} market status — resolved markets have verified TxLINE proofs.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th>
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="h-3 w-3" aria-hidden />
                  Market
                </span>
              </th>
              <th>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3 w-3" aria-hidden />
                  Fixture
                </span>
              </th>
              <th data-align="right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  Pool
                </span>
              </th>
              <th data-align="right" className="status-cell">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <Activity className="h-3 w-3" aria-hidden />
                  Status
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ view }) => (
              <tr key={view.id}>
                <td>
                  <Link
                    href={`/markets/${view.id}`}
                    className="font-medium transition-colors hover:text-brand"
                  >
                    #{view.id}
                  </Link>
                  <p className="mt-0.5 max-w-[12rem] truncate text-xs text-text-secondary">
                    {view.statLabel}
                  </p>
                </td>
                <td data-muted>
                  <Link
                    href={`/fixture/${view.fixtureId}`}
                    className="font-mono text-xs transition-colors hover:text-brand"
                  >
                    {view.fixtureId}
                  </Link>
                </td>
                <td data-align="right" className="font-mono text-sm tabular-nums">
                  {view.totalPool}
                </td>
                <td data-align="right" className="status-cell">
                  {view.status === "resolved" ? (
                    <Badge variant="success" className="shadow-none">Settled</Badge>
                  ) : (
                    <SettlementBadge status={view.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
