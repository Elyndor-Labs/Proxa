"use client";

import { useState } from "react";
import {
  Coins,
  Globe,
  Landmark,
  Percent,
  ScrollText,
  Shield,
  Vote,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClusterSwitcher } from "@/components/domain/cluster-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterTabs } from "@/components/layout/filter-tabs";
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

const GOV_TABS = [
  { label: "Parameters", value: "parameters" },
  { label: "Proposals", value: "proposals" },
];

const PARAM_ICONS: Record<string, typeof Globe> = {
  Network: Globe,
  "Protocol fee": Percent,
  "Markets created": ScrollText,
  Authority: Shield,
  "Stake mint": Coins,
  Treasury: Landmark,
};

/** Protocol parameters from on-chain config with governance roadmap. */
export function GovernanceView() {
  const [tab, setTab] = useState<Tab>("parameters");
  const { cluster } = useCluster();
  const { data: config, isLoading } = useConfig();

  return (
    <>
      <Breadcrumbs
        className="mb-4 mt-2"
        items={[{ label: "Governance" }]}
      />
      <PageHeader
        title="Governance"
        description="Live protocol parameters and upcoming on-chain governance."
        actions={<ClusterSwitcher />}
        icon={Shield}
        className="pt-2"
      />

      <FilterTabs
        tabs={GOV_TABS}
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        aria-label="Governance sections"
        className="mb-6"
      />

      {tab === "parameters" ? (
        <>
          <Card className="mb-6 rounded-[var(--radius-card)] border-[var(--surface-border)] shadow-none">
            <CardHeader>
              <CardTitle className="type-subheading text-base">Authority-controlled parameters</CardTitle>
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
          <Card className="mb-6 rounded-[var(--radius-card)] border-[var(--surface-border)] shadow-none">
            <CardHeader>
              <CardTitle className="type-subheading text-base">Proposal preview</CardTitle>
              <CardDescription>
                Example proposals below illustrate the upcoming governance UI. Voting is not yet
                active on-chain.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {UPCOMING_PROPOSALS.map((proposal) => (
              <Card
                key={proposal.id}
                className="rounded-[var(--radius-card)] border-[var(--surface-border)] opacity-90 shadow-none"
              >
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="muted">{proposal.status}</Badge>
                      <Badge variant="outline">{proposal.id}</Badge>
                    </div>
                    <CardTitle className="text-base font-semibold">{proposal.title}</CardTitle>
                    <CardDescription className="mt-1">Ends: {proposal.ends}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Vote className="h-3.5 w-3.5" aria-hidden />
                    Vote
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <VoteBar label="For" value={proposal.votesFor} />
                    <VoteBar label="Against" value={proposal.votesAgainst} negative />
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
  const Icon = PARAM_ICONS[label] ?? ScrollText;

  return (
    <Card className="rounded-[var(--radius-card)] border-[var(--surface-border)] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="inline-flex items-center gap-1.5 font-label text-xs font-medium text-text-secondary">
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            {label}
          </CardTitle>
          {governable && <Badge variant="outline">Governable</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-sm tabular-nums">{loading ? "…" : value}</p>
      </CardContent>
    </Card>
  );
}

function VoteBar({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  const parsed = value === "—" ? Number.NaN : Number.parseFloat(value);
  const width = Number.isFinite(parsed) ? `${Math.min(100, Math.max(0, parsed))}%` : "0%";

  return (
    <div className="rounded-control border border-(--surface-border) p-3">
      <p className="type-caption">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-sm tabular-nums",
          negative ? "text-negative" : "text-positive",
        )}
      >
        {value}
      </p>
      <div className="probability-bar mt-2">
        <div
          className={cn(
            "probability-bar__fill",
            negative ? "probability-bar__fill--negative" : "probability-bar__fill--positive",
          )}
          style={{ width }}
        />
      </div>
    </div>
  );
}
