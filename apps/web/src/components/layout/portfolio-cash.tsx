"use client";

import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatStake } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

interface PortfolioCashProps {
  className?: string;
}

/** Portfolio value shown in the navbar when logged in. */
export function PortfolioCash({ className }: PortfolioCashProps) {
  const mounted = useMounted();
  const { connected } = useWalletAuth();
  const { data: positions } = useEnrichedPositions();

  if (!mounted || !connected) return null;

  const portfolioValue = positions?.reduce(
    (sum, { position }) => sum + Number(formatStake(position.account.amount)),
    0,
  ) ?? 0;

  return (
    <div
      className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-label text-xs", className)}
      style={{
        borderColor: "var(--header-border)",
        backgroundColor: "var(--nav-link-hover-bg)",
      }}
    >
      <span className="text-muted-foreground">Portfolio</span>
      <span className="font-semibold tabular-nums text-success">${portfolioValue.toFixed(2)}</span>
    </div>
  );
}
