import { Suspense } from "react";
import { MarketList } from "@/features/markets/market-list";
import { OracleFeedTable } from "@/features/markets/oracle-feed-table";

function MarketsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<MarketsFallback />}>
      <MarketList />
      <div className="mt-10">
        <OracleFeedTable />
      </div>
    </Suspense>
  );
}
