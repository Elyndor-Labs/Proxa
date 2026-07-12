"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarkets } from "@/hooks/use-markets";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { isApiEnabled } from "@/config/api";

/** Market status feed — settlement state per market. */
export function OracleFeedTable() {
  const { data, isLoading } = useMarkets();

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  if (!data?.length) return null;

  const rows = data.slice(0, 10);
  const source = isApiEnabled() ? "API" : "on-chain";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Settlement Feed</CardTitle>
        <CardDescription>
          {source} market status — resolved markets have verified TxLINE proofs.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-label text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4">Market</th>
              <th className="pb-2 pr-4">Fixture</th>
              <th className="pb-2 pr-4">Pool</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ view }) => (
              <tr key={view.id} className="border-b border-border/50">
                <td className="py-3 pr-4">
                  <Link href={`/markets/${view.id}`} className="hover:text-brand">
                    #{view.id}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/fixture/${view.fixtureId}`} className="font-mono text-xs hover:text-brand">
                    {view.fixtureId}
                  </Link>
                </td>
                <td className="py-3 pr-4">{view.totalPool}</td>
                <td className="py-3">
                  {view.status === "resolved" ? (
                    <Badge variant="success">MERKLE_OK</Badge>
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
