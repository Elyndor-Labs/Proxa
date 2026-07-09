import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leaders = [
  { rank: 1, address: "7fC2a3…3F4D0", sol: "1,204.8", accuracy: "95.4%" },
  { rank: 2, address: "9aB1c4…8E2F1", sol: "982.3", accuracy: "91.2%" },
  { rank: 3, address: "3dE5f6…1A0B9", sol: "756.1", accuracy: "88.7%" },
] as const;

export default function LeaderboardPage() {
  return (
    <>
      <PageHeader title="Hall of Fame" description="Top operators ranked by SOL won and prediction accuracy." />

      <div className="grid gap-4 sm:grid-cols-3">
        {leaders.map((leader) => (
          <Card
            key={leader.rank}
            className={leader.rank === 1 ? "border-brand/40 sm:order-2" : leader.rank === 2 ? "sm:order-1" : "sm:order-3"}
          >
            <CardHeader className="text-center">
              <Badge variant={leader.rank === 1 ? "brand" : "muted"}>#{leader.rank}</Badge>
              <CardTitle className="font-mono text-sm">{leader.address}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-display text-2xl font-bold">{leader.sol} SOL</p>
              <p className="mt-1 font-label text-xs text-muted-foreground">{leader.accuracy} accuracy</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
