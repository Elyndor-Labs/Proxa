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
  bucketBounds: z.array(z.number()).optional(),
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

/** Production API — flat market object (list, fixture, detail). */
export const apiMarketSchema = z.object({
  marketId: numericString,
  fixtureId: numericString,
  statKey: z.number(),
  status: z.enum(["open", "resolved", "voided"]),
  numBuckets: z.number(),
  bucketBounds: z.array(z.number()).optional(),
  winningBucket: z.number(),
  winningValue: z.number(),
  totalPool: numericString,
  bucketPools: z.array(numericString),
  betsCloseTs: numericString,
  resolveAfterTs: numericString,
  resolveDeadlineTs: numericString.optional(),
  netPool: numericString.optional(),
  winningPool: numericString.optional(),
  feeBps: z.number().optional(),
  feeCollected: z.boolean().optional(),
  address: z.string().optional(),
});

export const apiMarketListSchema = z.object({
  data: z.array(apiMarketSchema),
});

export const apiPositionSchema = z.object({
  address: z.string(),
  marketId: numericString,
  bucket: z.number(),
  amount: numericString,
});

export const apiPositionListSchema = z.object({
  data: z.array(apiPositionSchema),
});

export const apiConfigSchema = z.object({
  authority: z.string(),
  stakeMint: z.string(),
  treasury: z.string(),
  feeBps: z.number(),
  marketCount: numericString,
});

/** Accepts production `{ data: [...] }`, mock paginated list, or bare array. */
export const marketsListResponseSchema = z.union([
  apiMarketListSchema,
  wireMarketsListResponseSchema,
  wireMarketRecordListSchema,
]);

/** Accepts production flat market, mock record, or bare account. */
export const marketResponseSchema = z.union([
  apiMarketSchema,
  wireMarketResponseSchema,
]);

/** Accepts production `{ data: [...] }` or mock position array. */
export const positionsListResponseSchema = z.union([
  apiPositionListSchema,
  wirePositionListSchema,
]);

export const notificationSchema = z.object({
  id: z.string(),
  wallet: z.string(),
  marketId: z.number(),
  type: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const notificationListSchema = z.object({
  data: z.array(notificationSchema),
});
