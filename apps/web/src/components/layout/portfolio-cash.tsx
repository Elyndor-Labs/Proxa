"use client";

import Link from "next/link";
import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStake } from "@/lib/format/odds";
import { cn } from "@/lib/utils";

interface PortfolioCashProps {
  className?: string;
}

/** Portfolio value chip in the navbar — matches header control height/radius. */
export function PortfolioCash({ className }: PortfolioCashProps) {
  const mounted = useMounted();
  const { connected } = useWalletAuth();
  const { data: positions, isLoading } = useEnrichedPositions();

  if (!mounted || !connected) return null;

  const portfolioValue =
    positions?.reduce(
      (sum, { position }) => sum + Number(formatStake(position.account.amount)),
      0,
    ) ?? 0;

  return (
    <Link href="/portfolio" className={cn("nav-portfolio", className)}>
      <span className="nav-portfolio__label">Portfolio</span>
      {isLoading ? (
        <Skeleton className="h-3.5 w-12" />
      ) : (
        <span className="nav-portfolio__value">
          $<AnimatedNumber value={portfolioValue} />
        </span>
      )}
    </Link>
  );
}
