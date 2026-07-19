"use client";

import Link from "next/link";
import { Copy, ExternalLink, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCluster } from "@/components/providers/cluster-provider";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfig } from "@/hooks/use-protocol-stats";
import { useStakeTokenBalance } from "@/hooks/use-token-balance";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { truncateAddress } from "@/lib/format/address";
import { formatStakeTokenLabel } from "@/lib/proxa/stake-token";

function copy(value: string, label: string) {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
}

/** Connected user profile with wallet, network, and protocol details. */
export function ProfileView() {
  const { publicKey, user } = useWalletAuth();
  const { cluster, rpc } = useCluster();
  const { data: config, isLoading } = useConfig();
  const { data: balance, isLoading: balanceLoading } = useStakeTokenBalance();
  const wallet = publicKey?.toBase58();
  const isAuthority =
    Boolean(publicKey && config?.authority && publicKey.equals(config.authority));
  const stakeMint = config?.stakeMint.toBase58();

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs className="mb-4" items={[{ label: "Profile" }]} />
        <PageHeader
          title="Profile"
          description="Wallet, login, network, and protocol access details."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand" aria-hidden="true" />
              Wallet
            </CardTitle>
            <CardDescription>Your connected Solana identity for Proxa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Address" value={wallet ? truncateAddress(wallet, 8) : "-"} rawValue={wallet} />
            <InfoRow
              label="Available balance"
              value={balanceLoading ? "Loading..." : `${balance?.label ?? "$0.00"} ${formatStakeTokenLabel(stakeMint)}`}
            />
            <InfoRow label="Network" value={cluster} />
            <InfoRow label="RPC" value={rpc} rawValue={rpc} />
            <InfoRow label="Privy user" value={user?.id ? truncateAddress(user.id, 8) : "Signed in"} rawValue={user?.id} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className={isAuthority ? "border-brand/40" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
                Protocol access
              </CardTitle>
              <CardDescription>
                {isAuthority ? "This wallet can launch markets." : "This wallet cannot launch markets."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Authority"
                value={
                  isLoading
                    ? "Loading..."
                    : config?.authority
                      ? truncateAddress(config.authority.toBase58(), 6)
                      : "-"
                }
                rawValue={config?.authority.toBase58()}
              />
              <InfoRow
                label="Stake token"
                value={formatStakeTokenLabel(stakeMint)}
                rawValue={stakeMint}
              />
              {isAuthority && (
                <Button variant="brand" className="w-full" asChild>
                  <Link href="/create">
                    Admin launch
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="secondary" asChild>
                <Link href="/portfolio">View portfolio</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/withdraw">Withdraw claimable payouts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  rawValue,
}: {
  label: string;
  value: string;
  rawValue?: string | null;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[var(--surface-border)] bg-black/20 px-3 py-2">
      <div className="min-w-0">
        <p className="font-label text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-label text-sm font-semibold">{value}</p>
      </div>
      {rawValue && (
        <button
          type="button"
          className="nav-icon-btn shrink-0"
          aria-label={`Copy ${label}`}
          onClick={() => copy(rawValue, label)}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
