import Link from "next/link";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  view: MarketView;
  odds?: string[];
  variant?: "teaser" | "full";
  hot?: boolean;
}

/** Reusable market card — compact on landing, full in app grid. */
export function MarketCard({ view, odds, variant = "full", hot }: MarketCardProps) {
  const isHot = hot ?? view.isOpen;

  return (
    <Card className={cn(isHot && "border-brand/40", variant === "teaser" && "max-w-lg")}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <SettlementBadge status={view.status} />
          {isHot && view.isOpen && (
            <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-label text-xs text-brand">
              Live
            </span>
          )}
        </div>
        <CardTitle className="text-base leading-snug">{view.title}</CardTitle>
        <CardDescription>
          <Link href={`/fixture/${view.fixtureId}`} className="hover:text-foreground">
            Fixture #{view.fixtureId}
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {variant === "full" && (
          <dl className="grid grid-cols-3 gap-2 font-label text-xs">
            <div>
              <dt className="text-muted-foreground">Pool</dt>
              <dd className="font-medium">{view.totalPool}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Buckets</dt>
              <dd className="font-medium">{view.numBuckets}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Closes</dt>
              <dd className="font-medium">{view.betsCloseLabel}</dd>
            </div>
          </dl>
        )}

        <div className="flex gap-2">
          {view.bucketLabels.slice(0, 2).map((label, index) =>
            variant === "teaser" ? (
              <Button key={label} variant={index === 0 ? "brand" : "outline"} className="flex-1" size="sm" asChild>
                <Link href={`/markets/${view.id}`}>{label}</Link>
              </Button>
            ) : (
              <Button key={label} variant={index === 0 ? "brand" : "outline"} className="flex-1" size="sm" disabled>
                {label}
                {odds?.[index] ? ` ${odds[index]}` : ""}
              </Button>
            ),
          )}
        </div>

        {variant === "teaser" && (
          <Button variant="secondary" className="w-full" size="sm" asChild>
            <Link href={`/markets/${view.id}`}>View Market</Link>
          </Button>
        )}

        {variant === "full" && (
          <Button variant="secondary" className="w-full" size="sm" asChild>
            <Link href={`/markets/${view.id}`}>View Market</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
