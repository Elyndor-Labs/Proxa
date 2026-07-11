import type { MarketView } from "@/lib/proxa/market-view";

export type MarketStatusFilter = "all" | "open" | "resolved" | "voided";

export interface MarketFilters {
  query: string;
  status: MarketStatusFilter;
}

/** Filters market views by search query and status. */
export function filterMarkets<T extends { view: MarketView }>(
  items: T[],
  { query, status }: MarketFilters,
): T[] {
  const q = query.trim().toLowerCase();

  return items.filter(({ view }) => {
    if (status !== "all" && view.status !== status) return false;
    if (!q) return true;

    return (
      view.id.includes(q) ||
      view.fixtureId.includes(q) ||
      view.title.toLowerCase().includes(q) ||
      view.statLabel.toLowerCase().includes(q)
    );
  });
}
