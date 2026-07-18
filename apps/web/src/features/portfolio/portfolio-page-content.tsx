"use client";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardPanel } from "@/features/leaderboard/leaderboard-panel";
import { PositionList } from "@/features/portfolio/position-list";

/** Portfolio page content with breadcrumbs and leaderboard sidebar. */
export function PortfolioPageContent() {
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <Breadcrumbs className="mb-4" items={[{ label: "Portfolio" }]} />
        <PageHeader title="Portfolio" description="Your positions and trade history." />
        <PositionList />
      </div>
      <aside className="hidden xl:block">
        <div className="sticky top-[calc(var(--header-height)+1.25rem)] max-h-[calc(100dvh-var(--header-height)-2.5rem)] overflow-y-auto">
          <LeaderboardPanel />
        </div>
      </aside>
    </div>
  );
}
