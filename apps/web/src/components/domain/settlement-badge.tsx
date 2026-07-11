import { Badge } from "@/components/ui/badge";
import type { MarketView } from "@/lib/proxa/market-view";
import { statusBadgeVariant } from "@/lib/proxa/market-view";

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
    <Badge variant={statusBadgeVariant(status)} className={className}>
      {LABELS[status]}
    </Badge>
  );
}
