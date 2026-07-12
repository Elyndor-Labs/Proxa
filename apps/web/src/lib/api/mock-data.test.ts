import { describe, expect, it } from "vitest";
import { deserializeMarketRecord, deserializePositionRecord } from "@/lib/api/deserialize";
import { getMockMarket, getMockMarketsByFixture, getMockPositions, filterMockMarkets } from "@/lib/api/mock-data";

describe("mock API data", () => {
  it("deserializes a single market", () => {
    const wire = getMockMarket("1");
    expect(wire).toBeDefined();
    const record = deserializeMarketRecord(wire!);
    expect(record.account.marketId.toString()).toBe("1");
    expect(record.account.fixtureId.toString()).toBe("17271370");
    expect(record.account.status).toEqual({ open: {} });
  });

  it("returns markets for the mock fixture", () => {
    const markets = getMockMarketsByFixture("17271370");
    expect(markets).toHaveLength(3);
    markets.forEach((wire) => {
      expect(() => deserializeMarketRecord(wire)).not.toThrow();
    });
  });

  it("filters mock markets by status and query", () => {
    expect(filterMockMarkets({ status: "open" })).toHaveLength(3);
    expect(filterMockMarkets({ status: "resolved" })).toHaveLength(0);
    expect(filterMockMarkets({ q: "1002" })).toHaveLength(1);
    expect(filterMockMarkets({ q: "1002" })[0]?.account.marketId).toBe("2");
    expect(filterMockMarkets({ fixtureId: "17271370" })).toHaveLength(3);
  });

  it("returns positions for any wallet", () => {
    const wallet = "11111111111111111111111111111111";
    const positions = getMockPositions(wallet);
    expect(positions).toHaveLength(2);
    positions.forEach((wire) => {
      const record = deserializePositionRecord(wire);
      expect(record.account.bettor.toBase58()).toBe(wallet);
    });
  });
});
