import { Suspense } from "react";
import { MarketList } from "@/features/markets/market-list";
// import { OracleFeedTable } from "@/features/markets/oracle-feed-table";
import { LeaderboardPanel } from "@/features/leaderboard/leaderboard-panel";

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
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <MarketList />
          {/* Market Settlement Feed — re-enable when ready
          <div className="mt-12">
            <OracleFeedTable />
          </div>
          */}
        </div>
        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--header-height)+1.25rem)] max-h-[calc(100dvh-var(--header-height)-2.5rem)] overflow-y-auto">
            <LeaderboardPanel />
          </div>
        </aside>
      </div>
    </Suspense>
  );
}
