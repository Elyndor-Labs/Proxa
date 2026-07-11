import { SettlementBadge } from "@/components/domain/settlement-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** CSS-built product preview for the landing hero — no static image required. */
export function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-lg lg:mx-0">
      <div className="absolute -inset-4 rounded-2xl bg-brand/10 blur-2xl" aria-hidden />
      <Card className="relative border-brand/30 shadow-2xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
          <CardTitle className="font-display text-sm">Live Markets</CardTitle>
          <Badge variant="brand">Devnet</Badge>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <SettlementBadge status="open" />
              <span className="font-label text-xs text-brand">Live</span>
            </div>
            <p className="mt-2 font-display text-sm font-semibold">Haaland goals — Full match</p>
            <p className="font-label text-xs text-muted-foreground">Fixture #17271370 · Pool $12,400</p>
            <div className="mt-3 flex gap-2">
              <Button variant="brand" size="sm" className="flex-1" disabled>
                0-1
              </Button>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                2+
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 font-label text-xs text-muted-foreground">
            Prop Slip · 2 legs · $50.00 total stake
          </div>

          <Button variant="brand" className="w-full" disabled>
            Place Prop Bet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
