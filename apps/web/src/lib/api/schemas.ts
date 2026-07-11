import { z } from "zod";

const numericString = z.union([z.string(), z.number()]);

const emptyRecord = z.object({}).strict();

export const wireMarketStatusSchema = z.union([
  z.enum(["open", "resolved", "voided"]),
  z.object({ open: emptyRecord }),
  z.object({ resolved: emptyRecord }),
  z.object({ voided: emptyRecord }),
]);

export const wireMarketAccountSchema = z.object({
  marketId: numericString,
  creator: z.string(),
  fixtureId: numericString,
  statKey: z.number(),
  numBuckets: z.number(),
  betsCloseTs: numericString,
  resolveAfterTs: numericString,
  resolveDeadlineTs: numericString,
  feeBps: z.number(),
  stakeMint: z.string(),
  vault: z.string(),
  totalPool: numericString,
  bucketPools: z.array(numericString),
  status: wireMarketStatusSchema,
  winningBucket: z.number(),
  winningValue: z.number(),
  netPool: numericString,
  winningPool: numericString,
  feeCollected: z.boolean(),
  bump: z.number(),
  vaultBump: z.number(),
});

export const wireMarketRecordSchema = z.object({
  address: z.string(),
  account: wireMarketAccountSchema,
});

export const wireMarketsListResponseSchema = z.object({
  items: z.array(wireMarketRecordSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const wireMarketRecordListSchema = z.array(wireMarketRecordSchema);

export const wireMarketResponseSchema = z.union([wireMarketRecordSchema, wireMarketAccountSchema]);

export const wirePositionAccountSchema = z.object({
  marketId: numericString,
  bettor: z.string(),
  bucket: z.number(),
  amount: numericString,
  bump: z.number(),
});

export const wirePositionRecordSchema = z.object({
  address: z.string(),
  account: wirePositionAccountSchema,
});

export const wirePositionListSchema = z.array(wirePositionRecordSchema);

export const leaderboardEntrySchema = z.object({
  address: z.string(),
  displayAddress: z.string(),
  totalStaked: z.string(),
  totalWinnings: z.string(),
  positionCount: z.number(),
});

export const leaderboardListSchema = z.array(leaderboardEntrySchema);
