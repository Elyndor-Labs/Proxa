"use client";

import Link from "next/link";
import { MarketCard } from "@/components/domain/market-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMounted } from "@/hooks/use-mounted";
import { useMarkets } from "@/hooks/use-markets";

function PreviewSkeleton() {
  return <div className="mt-8 h-48 max-w-lg animate-pulse rounded-xl bg-muted" />;
}

/** Landing page preview of the first live on-chain market. */
export function FeaturedMarketsPreview() {
  const mounted = useMounted();
  const { data, isLoading } = useMarkets({ enabled: mounted });

  if (!mounted || isLoading) {
    return <PreviewSkeleton />;
  }

  const first = data?.[0];

  if (!first) {
    return (
      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle>No live markets</CardTitle>
          <CardDescription>Markets will appear here once created on devnet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="brand" asChild>
            <Link href="/markets">Browse Markets</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 flex justify-center lg:justify-start">
      <MarketCard view={first.view} variant="teaser" />
    </div>
  );
}
