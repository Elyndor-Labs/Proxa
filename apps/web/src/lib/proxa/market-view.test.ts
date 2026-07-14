import { describe, expect, it } from "vitest";
import { BN } from "@coral-xyz/anchor";
import type { MarketAccount } from "@proxa/sdk";
import { toMarketView } from "@/lib/proxa/market-view";

function mockMarketAccount(overrides: Partial<MarketAccount> = {}): MarketAccount {
  return {
    marketId: new BN(1),
    fixtureId: new BN(123),
    statKey: 1,
    numBuckets: 2,
    status: { open: {} },
    bucketPools: [new BN(0), new BN(0)],
    totalPool: new BN(0),
    betsCloseTs: new BN(Math.floor(Date.now() / 1000) + 3600),
    resolveAfterTs: new BN(0),
    resolveDeadlineTs: new BN(0),
    winningBucket: 0,
    winningValue: 0,
    stakeMint: {} as MarketAccount["stakeMint"],
    feeCollected: false,
    bump: 0,
    ...overrides,
  } as MarketAccount;
}

describe("toMarketView bucket labels", () => {
  it("labels binary markets by count buckets instead of yes/no", () => {
    const view = toMarketView(mockMarketAccount({ numBuckets: 2 }));
    expect(view.bucketLabels).toEqual(["0 goals", "1+ goals"]);
  });

  it("labels multi-bucket markets with overflow bucket", () => {
    const view = toMarketView(mockMarketAccount({ numBuckets: 4 }));
    expect(view.bucketLabels).toEqual(["0 goals", "1 goals", "2 goals", "3+ goals"]);
  });
});
