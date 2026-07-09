import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function GovernancePage() {
  return (
    <>
      <PageHeader title="Governance Hub" description="Vote on protocol parameters and review active proposals." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-brand/30">
          <CardHeader>
            <Badge variant="brand">Voting Live</Badge>
            <CardTitle className="mt-2">Adjust Keeper Reward Split</CardTitle>
            <CardDescription>2d 14h remaining · 68% quorum reached</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="brand">Vote</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="muted">Pending Review</Badge>
            <CardTitle className="mt-2">Increase BTC Market Depth Parameters</CardTitle>
            <CardDescription>Voting starts in 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Details</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
