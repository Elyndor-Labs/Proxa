import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeaturedMarket } from "@/features/landing/data";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: FeaturedMarket;
  variant?: "teaser" | "full";
}

/** Reusable market card — compact on landing, full in app grid. */
export function MarketCard({ market, variant = "full" }: MarketCardProps) {
  return (
    <Card className={cn(market.hot && "border-brand/40", variant === "teaser" && "max-w-lg")}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="muted">{market.sport}</Badge>
          {market.hot && <Badge variant="brand">Hot Feed</Badge>}
        </div>
        <CardTitle className="text-base leading-snug">{market.title}</CardTitle>
        <CardDescription>{market.league}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {variant === "full" && (
          <dl className="grid grid-cols-3 gap-2 font-label text-xs">
            <div>
              <dt className="text-muted-foreground">Volume</dt>
              <dd className="font-medium">{market.volume}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Liquidity</dt>
              <dd className="font-medium">{market.liquidity}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ends in</dt>
              <dd className="font-medium">{market.endsIn}</dd>
            </div>
          </dl>
        )}

        <div className="flex gap-2">
          <Button variant="brand" className="flex-1" size="sm">
            Yes {market.yesOdds}
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            No {market.noOdds}
          </Button>
        </div>

        {variant === "full" && (
          <Button variant="secondary" className="w-full" size="sm" asChild>
            <Link href={`/markets/${market.id}`}>Build Prop</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
