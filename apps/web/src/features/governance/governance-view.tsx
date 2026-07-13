"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ClusterSwitcher } from "@/components/domain/cluster-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCluster } from "@/components/providers/cluster-provider";
import { useConfig } from "@/hooks/use-protocol-stats";
import { truncateAddress } from "@/lib/format/address";
import { cn } from "@/lib/utils";

const UPCOMING_PROPOSALS = [
  {
    id: "prop-001",
    title: "Reduce protocol fee to 1.5%",
    status: "Preview",
    votesFor: "—",
    votesAgainst: "—",
    ends: "Not started",
  },
  {
    id: "prop-002",
    title: "Transfer treasury authority to multisig",
    status: "Preview",
    votesFor: "—",
    votesAgainst: "—",
    ends: "Not started",
  },
] as const;

type Tab = "parameters" | "proposals";

/** Protocol parameters from on-chain config with governance roadmap. */
export function GovernanceView() {
  const [tab, setTab] = useState<Tab>("parameters");
  const { cluster } = useCluster();
  const { data: config, isLoading } = useConfig();

  return (
    <>
      <PageHeader
        title="Governance"
        description="Live protocol parameters and upcoming on-chain governance."
        actions={<ClusterSwitcher />}
      />

      <div className="mb-6 flex gap-2" role="tablist" aria-label="Governance sections">
        {(
          [
            { id: "parameters" as const, label: "Parameters" },
            { id: "proposals" as const, label: "Proposals" },
          ] as const
        ).map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            variant={tab === item.id ? "brand" : "outline"}
            size="sm"
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {tab === "parameters" ? (
        <>
          <Card className="mb-6 border-brand/20 bg-brand/5">
            <CardHeader>
              <CardTitle className="text-base">Authority-controlled parameters</CardTitle>
              <CardDescription>
                On-chain governance voting is in development. Until deployment, these parameters are
                updated by the protocol authority multisig. Switch network to inspect live config.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ParamCard label="Network" value={cluster} loading={false} />
            <ParamCard
              label="Protocol fee"
              value={config ? `${(config.feeBps / 100).toFixed(2)}%` : "—"}
              loading={isLoading}
              governable
            />
            <ParamCard
              label="Markets created"
              value={config?.marketCount.toString() ?? "—"}
              loading={isLoading}
            />
            <ParamCard
              label="Authority"
              value={config ? truncateAddress(config.authority.toBase58(), 6) : "—"}
              loading={isLoading}
              governable
            />
            <ParamCard
              label="Stake mint"
              value={config ? truncateAddress(config.stakeMint.toBase58(), 6) : "—"}
              loading={isLoading}
            />
            <ParamCard
              label="Treasury"
              value={config ? truncateAddress(config.treasury.toBase58(), 6) : "—"}
              loading={isLoading}
              governable
            />
          </div>
        </>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Proposal preview</CardTitle>
              <CardDescription>
                Example proposals below illustrate the upcoming governance UI. Voting is not yet
                active on-chain.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {UPCOMING_PROPOSALS.map((proposal) => (
              <Card key={proposal.id} className="opacity-90">
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="muted">{proposal.status}</Badge>
                      <Badge variant="outline">{proposal.id}</Badge>
                    </div>
                    <CardTitle className="text-base">{proposal.title}</CardTitle>
                    <CardDescription className="mt-1">Ends: {proposal.ends}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Vote
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <VoteBar label="For" value={proposal.votesFor} />
                    <VoteBar label="Against" value={proposal.votesAgainst} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ParamCard({
  label,
  value,
  loading,
  governable,
}: {
  label: string;
  value: string;
  loading: boolean;
  governable?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-label text-xs font-medium text-muted-foreground">{label}</CardTitle>
          {governable && <Badge variant="muted">Governable</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-sm">{loading ? "…" : value}</p>
      </CardContent>
    </Card>
  );
}

function VoteBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="font-label text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-sm", label === "For" && "text-brand")}>{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-muted">
        <div className="h-full w-0 rounded-full bg-brand" />
      </div>
    </div>
  );
}
