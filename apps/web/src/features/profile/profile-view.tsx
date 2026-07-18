"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProfileFieldRow } from "@/components/domain/profile-field-row";
import { useCluster } from "@/components/providers/cluster-provider";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnchorWallet } from "@/hooks/use-anchor-wallet";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useConfig } from "@/hooks/use-protocol-stats";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { truncateAddress } from "@/lib/format/address";
import { formatStake } from "@/lib/format/odds";

/** Wallet identity and protocol access with differentiated field styling. */
export function ProfileView() {
  const { publicKey, user } = useWalletAuth();
  const wallet = useAnchorWallet();
  const { cluster, rpc } = useCluster();
  const { data: config, isLoading: configLoading } = useConfig();
  const { data: positions, isLoading: positionsLoading } = useEnrichedPositions();

  const address = publicKey?.toBase58() ?? "—";
  const privyUser = user?.email?.address ?? user?.wallet?.address ?? "—";

  const portfolioValue = useMemo(
    () =>
      positions?.reduce(
        (sum, { position }) => sum + Number(formatStake(position.account.amount)),
        0,
      ) ?? 0,
    [positions],
  );

  const isAuthority =
    wallet?.publicKey && config?.authority && wallet.publicKey.equals(config.authority);

  const loading = configLoading || positionsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <Card className="profile-panel shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="type-subheading inline-flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-brand" aria-hidden />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="profile-panel__fields pt-4">
          {loading ? (
            <>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </>
          ) : (
            <>
              <ProfileFieldRow label="Address" value={truncateAddress(address, 6)} copyable copyText={address} />
              <ProfileFieldRow
                label="Portfolio value"
                value={
                  <>
                    $<AnimatedNumber value={portfolioValue} />
                  </>
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="profile-panel shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="type-subheading text-base">Protocol Access</CardTitle>
        </CardHeader>
        <CardContent className="profile-panel__fields pt-4">
          {loading ? (
            <>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </>
          ) : (
            <>
              <ProfileFieldRow label="Network" value={cluster} readonly />
              <ProfileFieldRow label="RPC" value={truncateAddress(rpc, 8)} readonly />
              {config && (
                <ProfileFieldRow
                  label="Authority"
                  value={truncateAddress(config.authority.toBase58(), 6)}
                  copyable
                  copyText={config.authority.toBase58()}
                />
              )}
              <ProfileFieldRow label="Privy user" value={privyUser} readonly />
            </>
          )}
        </CardContent>
      </Card>

      {!loading && config && !isAuthority && (
        <div className="status-banner status-banner--warning" role="status">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <span>This wallet cannot launch markets</span>
        </div>
      )}

      <div className="profile-actions">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portfolio">View portfolio</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/withdraw">Withdraw claimable payouts</Link>
        </Button>
      </div>
    </div>
  );
}
