"use client";

import type { BN } from "@coral-xyz/anchor";
import { useClaim } from "@/hooks/use-claim";
import { useProxaClient } from "@/hooks/use-proxa-client";
import { Button } from "@/components/ui/button";
import { formatStake } from "@/lib/format/odds";

interface ClaimButtonProps {
  marketId: string;
  bucket: number;
  claimable: BN;
  size?: "default" | "sm" | "lg";
}

/** One-click claim for settled winning positions. */
export function ClaimButton({ marketId, bucket, claimable, size = "sm" }: ClaimButtonProps) {
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
      {claim.isPending ? "Claiming…" : `Claim $${formatStake(claimable)}`}
    </Button>
  );
}
