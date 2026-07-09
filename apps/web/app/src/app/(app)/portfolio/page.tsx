import { RequireWallet } from "@/components/auth/require-wallet";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortfolioPage() {
  return (
    <>
      <PageHeader title="Portfolio" description="Your active positions and claimable winnings." />

      <RequireWallet>
        <Card>
          <CardHeader>
            <CardTitle>No positions yet</CardTitle>
            <CardDescription>Place a bet on a live market to see your portfolio here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="muted">Connected</Badge>
          </CardContent>
        </Card>
      </RequireWallet>
    </>
  );
}
