import Link from "next/link";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { LiveCloseLabel } from "@/components/domain/live-close-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketView } from "@/lib/proxa/market-view";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  view: MarketView;
  odds?: string[];
  variant?: "teaser" | "full";
  featured?: boolean;
  hot?: boolean;
}

/** Reusable market card — mentioned.market style. */
export function MarketCard({ view, odds, variant = "full", featured, hot }: MarketCardProps) {
  const isHot = hot ?? view.isOpen;
  const isFree = Number(view.id) % 2 === 1;

  if (featured) {
    return (
      <Card className="hover-lift overflow-hidden border-border/60">
        <div className="relative bg-gradient-to-br from-secondary/60 via-card to-brand/5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SettlementBadge status={view.status} />
            <Badge variant="muted">Featured</Badge>
            <Badge variant={isFree ? "brand" : "secondary"}>{isFree ? "FREE" : "PAID"}</Badge>
          </div>
          <CardTitle className="mt-4 text-xl leading-snug sm:text-2xl">{view.title}</CardTitle>
          <CardDescription className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span>19 traders</span>
            <span>·</span>
            <span>{view.numBuckets} words</span>
            <span>·</span>
            <LiveCloseLabel targetMs={view.betsCloseTs} />
          </CardDescription>
        </div>
        <CardContent className="grid gap-2 p-4 sm:grid-cols-2">
          {view.bucketLabels.map((label, index) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
            >
              <span className="font-label text-sm font-medium">{label}</span>
              <div className="flex gap-2 font-label text-sm">
                <span className="text-success">{odds?.[index]?.split(" ")[0] ?? "50¢"}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive">{odds?.[index]?.split(" ")[1] ?? "50¢"}</span>
              </div>
            </div>
          ))}
          <Button variant="brand" className="mt-2 sm:col-span-2" asChild>
            <Link href={`/markets/${view.id}`}>Trade this market</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover-lift border-border/60", isHot && "border-brand/25", variant === "teaser" && "max-w-lg")}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <SettlementBadge status={view.status} />
            <Badge variant={isFree ? "brand" : "secondary"} className="text-[10px]">
              {isFree ? "FREE" : "PAID"}
            </Badge>
          </div>
          {isHot && view.isOpen && (
            <span className="rounded-md bg-destructive/15 px-2 py-0.5 font-label text-[10px] font-semibold uppercase text-destructive">
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

      <CardContent className="space-y-3">
        {variant === "full" && (
          <div className="space-y-1.5">
            {view.bucketLabels.slice(0, 4).map((label, index) => (
              <div key={label} className="flex items-center justify-between font-label text-xs">
                <span>{label}</span>
                <div className="flex gap-1.5">
                  <span className="text-success">{odds?.[index] ?? "50¢"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between font-label text-xs text-muted-foreground">
          <span>12 traders · {view.numBuckets} words</span>
          <LiveCloseLabel targetMs={view.betsCloseTs} />
        </div>

        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link href={`/markets/${view.id}`}>View Market</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
