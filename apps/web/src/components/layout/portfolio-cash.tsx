"use client";

import { useEnrichedPositions } from "@/hooks/use-enriched-positions";
import { useMounted } from "@/hooks/use-mounted";
import { useStakeTokenBalance } from "@/hooks/use-token-balance";
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
  const { data: cash } = useStakeTokenBalance();

  if (!mounted || !connected) return null;

  const portfolioValue = positions?.reduce(
    (sum, { position }) => sum + Number(formatStake(position.account.amount)),
    0,
  ) ?? 0;

  return (
    <div
      className={cn("hidden items-center gap-4 rounded-md border px-3 py-1.5 font-label text-xs sm:flex", className)}
      style={{
        borderColor: "var(--header-border)",
        backgroundColor: "var(--nav-link-hover-bg)",
      }}
    >
      <BalanceLabel label="Portfolio" value={`$${portfolioValue.toFixed(2)}`} />
      <BalanceLabel label="Cash" value={cash?.label ?? "$0.00"} />
    </div>
  );
}

function BalanceLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-none">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-success">{value}</p>
    </div>
  );
}
