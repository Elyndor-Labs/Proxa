"use client";

import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatStake } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

interface PortfolioCashProps {
  className?: string;
}

/** Portfolio and cash balances shown in the navbar when logged in. */
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
    <div className={cn("hidden items-center gap-4 font-label text-sm lg:flex", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Portfolio</span>
        <span className="font-medium text-success">${portfolioValue.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Cash</span>
        <span className="font-medium text-success">$0.00</span>
      </div>
    </div>
  );
}
