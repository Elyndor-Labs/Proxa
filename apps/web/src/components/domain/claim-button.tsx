"use client";

import type { BN } from "@coral-xyz/anchor";
import { Button } from "@/components/ui/button";
import { useClaim } from "@/hooks/use-claim";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { formatStake } from "@/lib/format/odds";

interface ClaimButtonProps {
  marketId: string;
  bucket: number;
  claimable: BN;
  tokenLabel?: string;
  size?: "default" | "sm" | "lg";
}

/** One-click claim for settled winning positions. */
export function ClaimButton({
  marketId,
  bucket,
  claimable,
  tokenLabel = "stake token",
  size = "sm",
}: ClaimButtonProps) {
  const claim = useClaim();
  const { canTransact } = useProxaClient();

  if (claimable.isZero() || !canTransact) return null;

  return (
    <Button
      type="button"
      variant="brand"
      size={size}
      disabled={claim.isPending}
      onClick={() => claim.mutate({ marketId, bucket })}
    >
      {claim.isPending ? "Claiming..." : `Claim ${formatStake(claimable)} ${tokenLabel}`}
    </Button>
  );
}
