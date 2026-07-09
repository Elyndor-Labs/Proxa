import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Total Value Locked", value: "$142,842,109", change: "+4.2%" },
  { label: "24h Volume", value: "$8,122,050", change: "+2.8%" },
  { label: "Active Keepers", value: "1,204", change: null },
  { label: "Merkle Proofs Verified", value: "89.2M", change: null },
] as const;

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Network Overview"
        description="Protocol-wide metrics and your performance at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-label text-xs font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              {stat.change && (
                <Badge variant="success" className="mt-2">
                  {stat.change}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
