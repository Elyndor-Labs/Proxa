import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevHubPage() {
  return (
    <>
      <PageHeader
        title="Dev Hub"
        description="Protocol documentation, SDK reference, and Merkle proof specifications."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card id="merkle">
          <CardHeader>
            <CardTitle>Merkle Security</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm text-muted-foreground">
            leaf = hash(match_id || stat_type || value || timestamp)
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Initializing a Market</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">
            <span className="text-secondary">const</span> client ={" "}
            <span className="text-brand">new ProxaClient</span>(provider);
          </CardContent>
        </Card>
      </div>
    </>
  );
}
