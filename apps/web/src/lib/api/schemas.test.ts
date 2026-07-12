import { describe, expect, it } from "vitest";
import { MOCK_LEADERBOARD, MOCK_MARKETS } from "@/lib/api/mock-data";
import {
  apiMarketListSchema,
  apiMarketSchema,
  leaderboardListSchema,
  marketsListResponseSchema,
  marketResponseSchema,
  wireMarketRecordListSchema,
  wireMarketRecordSchema,
  wireMarketsListResponseSchema,
  wirePositionListSchema,
} from "@/lib/api/schemas";

describe("API response schemas", () => {
  it("parses mock market records", () => {
    for (const market of MOCK_MARKETS) {
      expect(() => wireMarketRecordSchema.parse(market)).not.toThrow();
    }
  });

  it("parses paginated markets list", () => {
    const payload = {
      items: MOCK_MARKETS,
      total: MOCK_MARKETS.length,
      page: 1,
      limit: 50,
    };
    expect(wireMarketsListResponseSchema.parse(payload)).toEqual(payload);
  });

  it("parses production markets list", () => {
    const payload = {
      data: [
        {
          marketId: "7",
          fixtureId: "17952170",
          statKey: 1,
          status: "open",
          numBuckets: 6,
          winningBucket: 255,
          winningValue: 0,
          totalPool: "0",
          bucketPools: ["0"],
          betsCloseTs: "1783155905",
          resolveAfterTs: "1783155905",
          address: "26fCCXj3HoKmiamv1JgUGga8NJkxfejNPCxm5XhAvQr3",
        },
      ],
    };
    expect(apiMarketListSchema.parse(payload)).toEqual(payload);
    expect(marketsListResponseSchema.parse(payload)).toEqual(payload);
  });

  it("parses production single market", () => {
    const payload = {
      marketId: "7",
      fixtureId: "17952170",
      statKey: 1,
      status: "open",
      numBuckets: 6,
      winningBucket: 255,
      winningValue: 0,
      totalPool: "0",
      netPool: "0",
      winningPool: "0",
      bucketPools: ["0"],
      feeBps: 100,
      feeCollected: false,
      betsCloseTs: "1783155905",
      resolveAfterTs: "1783155905",
      resolveDeadlineTs: "1783159501",
    };
    expect(apiMarketSchema.parse(payload)).toEqual(payload);
    expect(marketResponseSchema.parse(payload)).toEqual(payload);
  });

  it("parses fixture markets array", () => {
    expect(wireMarketRecordListSchema.parse(MOCK_MARKETS)).toHaveLength(MOCK_MARKETS.length);
  });

  it("parses mock leaderboard", () => {
    expect(leaderboardListSchema.parse(MOCK_LEADERBOARD)).toEqual(MOCK_LEADERBOARD);
  });

  it("parses mock positions", () => {
    const positions = [
      {
        address: "Config1111111111111111111111111111111111111",
        account: { marketId: "1", bettor: "11111111111111111111111111111111", bucket: 0, amount: "500000", bump: 255 },
      },
    ];
    expect(wirePositionListSchema.parse(positions)).toHaveLength(1);
  });
});
