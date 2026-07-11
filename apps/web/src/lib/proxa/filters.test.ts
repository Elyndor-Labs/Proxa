import { describe, expect, it } from "vitest";
import { filterMarkets } from "@/lib/proxa/filters";
import type { MarketView } from "@/lib/proxa/market-view";

function mockMarket(overrides: Partial<MarketView> = {}): { view: MarketView } {
  return {
    view: {
      id: "1",
      fixtureId: "17271370",
      title: "Haaland goals",
      statLabel: "Goals",
      status: "open",
      isOpen: true,
      totalPool: "$100",
      numBuckets: 2,
      bucketLabels: ["0-1", "2+"],
      betsCloseLabel: "Soon",
      ...overrides,
    },
  };
}

describe("filterMarkets", () => {
  const markets = [
    mockMarket(),
    mockMarket({
      id: "2",
      fixtureId: "99999999",
      title: "Salah assists",
      statLabel: "Assists",
      status: "resolved",
      isOpen: false,
    }),
  ];

  it("returns all markets when no filters applied", () => {
    expect(filterMarkets(markets, { query: "", status: "all" })).toHaveLength(2);
  });

  it("filters by status", () => {
    expect(filterMarkets(markets, { query: "", status: "open" })).toHaveLength(1);
    expect(filterMarkets(markets, { query: "", status: "resolved" })[0].view.id).toBe("2");
  });

  it("filters by query across id, fixture, title, and stat", () => {
    expect(filterMarkets(markets, { query: "haaland", status: "all" })).toHaveLength(1);
    expect(filterMarkets(markets, { query: "17271370", status: "all" })).toHaveLength(1);
    expect(filterMarkets(markets, { query: "assists", status: "all" })).toHaveLength(1);
  });
});
