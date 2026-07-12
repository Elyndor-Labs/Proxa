import { describe, expect, it } from "vitest";
import { MOCK_LEADERBOARD, MOCK_MARKETS } from "@/lib/api/mock-data";
import {
  leaderboardListSchema,
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
