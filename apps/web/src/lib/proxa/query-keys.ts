/** React Query cache keys for on-chain data. */
export const queryKeys = {
  markets: ["markets"] as const,
  market: (id: string) => ["markets", id] as const,
  fixtures: ["fixtures", "list"] as const,
  fixtureMarkets: (fixtureId: string) => ["fixtures", fixtureId] as const,
  fixtureDetail: (fixtureId: string) => ["fixtures", fixtureId, "detail"] as const,
  positions: (owner: string) => ["positions", owner] as const,
  positionsEnriched: (owner: string) => ["positions-enriched", owner] as const,
  tokenBalance: (owner: string, mint: string) => ["token-balance", owner, mint] as const,
  notifications: (wallet: string) => ["notifications", wallet] as const,
  config: ["config"] as const,
};
