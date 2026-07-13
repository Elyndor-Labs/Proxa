import { describe, expect, it } from "vitest";
import {
  apiMarketListSchema,
  apiMarketSchema,
  notificationListSchema,
  marketsListResponseSchema,
  marketResponseSchema,
  wireMarketRecordListSchema,
  wireMarketRecordSchema,
  wireMarketsListResponseSchema,
  wirePositionListSchema,
} from "@/lib/api/schemas";

const mockMarketRecord = {
  address: "26fCCXj3HoKmiamv1JgUGga8NJkxfejNPCxm5XhAvQr3",
  account: {
    marketId: "7",
    creator: "11111111111111111111111111111111",
    fixtureId: "17952170",
    statKey: 1,
    numBuckets: 6,
    betsCloseTs: "1783155905",
    resolveAfterTs: "1783155905",
    resolveDeadlineTs: "1783159501",
    feeBps: 100,
    stakeMint: "ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh",
    vault: "11111111111111111111111111111111",
    totalPool: "0",
    bucketPools: ["0", "0", "0", "0", "0", "0"],
    status: "open" as const,
    winningBucket: 255,
    winningValue: 0,
    netPool: "0",
    winningPool: "0",
    feeCollected: false,
    bump: 0,
    vaultBump: 0,
  },
};

describe("API response schemas", () => {
  it("parses wire market records", () => {
    expect(() => wireMarketRecordSchema.parse(mockMarketRecord)).not.toThrow();
  });

  it("parses paginated markets list", () => {
    const payload = {
      items: [mockMarketRecord],
      total: 1,
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
    expect(wireMarketRecordListSchema.parse([mockMarketRecord])).toHaveLength(1);
  });

  it("parses notifications list", () => {
    const payload = {
      data: [
        {
          id: "abc",
          wallet: "11111111111111111111111111111111",
          marketId: 7,
          type: "resolved",
          message: "Market resolved",
          read: false,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(notificationListSchema.parse(payload)).toEqual(payload);
  });

  it("parses wire positions", () => {
    const positions = [
      {
        address: "Config1111111111111111111111111111111111111",
        account: { marketId: "1", bettor: "11111111111111111111111111111111", bucket: 0, amount: "500000", bump: 255 },
      },
    ];
    expect(wirePositionListSchema.parse(positions)).toHaveLength(1);
  });
});
