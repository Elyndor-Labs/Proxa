"use client";

import { quoteClaim } from "@proxa/sdk";
import type { MarketAccount } from "@proxa/sdk";
import { ClaimButton } from "@/components/domain/claim-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePositions } from "@/hooks/use-positions";
import { formatStake } from "@/lib/format/odds";

interface MarketPositionPanelProps {
  marketId: string;
  account: MarketAccount;
}

/** Shows the connected wallet's position and claim action for this market. */
export function MarketPositionPanel({ marketId, account }: MarketPositionPanelProps) {
  const { data: positions } = usePositions();

  const position = positions?.find((p) => p.account.marketId.toString() === marketId);
  if (!position) return null;

  const claimable = quoteClaim(account, position.account);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Position</CardTitle>
        <CardDescription>
          Bucket {position.account.bucket + 1} · Stake ${formatStake(position.account.amount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClaimButton marketId={marketId} bucket={position.account.bucket} claimable={claimable} size="default" />
      </CardContent>
    </Card>
  );
}
