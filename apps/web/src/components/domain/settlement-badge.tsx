import { Badge } from "@/components/ui/badge";
import type { MarketView } from "@/lib/proxa/market-view";
import { statusBadgeVariant } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface SettlementBadgeProps {
  status: MarketView["status"];
  className?: string;
}

const LABELS: Record<MarketView["status"], string> = {
  open: "Open",
  resolved: "Settled",
  voided: "Voided",
};

/** Displays market settlement status with semantic styling. */
export function SettlementBadge({ status, className }: SettlementBadgeProps) {
  return (
    <Badge
      variant={statusBadgeVariant(status)}
      className={cn(status === "open" && "badge-pulse", className)}
    >
      {LABELS[status]}
    </Badge>
  );
}
