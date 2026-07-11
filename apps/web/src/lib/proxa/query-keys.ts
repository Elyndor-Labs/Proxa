/** React Query cache keys for on-chain data. */
export const queryKeys = {
  markets: ["markets"] as const,
  market: (id: string) => ["markets", id] as const,
  fixtureMarkets: (fixtureId: string) => ["fixtures", fixtureId] as const,
  positions: (owner: string) => ["positions", owner] as const,
  positionsEnriched: (owner: string) => ["positions-enriched", owner] as const,
  config: ["config"] as const,
};
