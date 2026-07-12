import Link from "next/link";
import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Static landing teaser — avoids API/SDK work during marketing page compile. */
export function FeaturedMarketsPreview() {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 lg:items-start">
      <Card className="max-w-lg border-brand/40">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <SettlementBadge status="open" />
            <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-label text-xs text-brand">
              Live
            </span>
          </div>
          <CardTitle className="text-base leading-snug">Fixture #17271370 · P1 Goals</CardTitle>
          <CardDescription>
            <Link href="/fixture/17271370" className="hover:text-foreground">
              Fixture #17271370
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="brand" className="flex-1" size="sm" asChild>
              <Link href="/markets/1">Yes</Link>
            </Button>
            <Button variant="outline" className="flex-1" size="sm" asChild>
              <Link href="/markets/1">No</Link>
            </Button>
          </div>
          <Button variant="secondary" className="w-full" size="sm" asChild>
            <Link href="/markets/1">View Market</Link>
          </Button>
        </CardContent>
      </Card>
      <Button variant="outline" asChild>
        <Link href="/markets">Browse all markets</Link>
      </Button>
    </div>
  );
}
