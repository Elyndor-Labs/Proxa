import { PublicKey } from "@solana/web3.js";

export const PROXA_PROGRAM_ID = new PublicKey("6LAR9TGXRnsLVtc4MibivdgNgqWGpiXMsR64p21VCRDZ");

export const SEEDS = {
  config: Buffer.from("config"),
  market: Buffer.from("market"),
  vault: Buffer.from("vault"),
  position: Buffer.from("position"),
  dailyScoresRoots: Buffer.from("daily_scores_roots"),
  pricingMatrix: Buffer.from("pricing_matrix"),
  tokenTreasury: Buffer.from("token_treasury_v2"),
} as const;

export const MS_PER_DAY = 86_400_000;
export const MAX_BUCKETS = 12;
export const MAX_FEE_BPS = 1000;
export const RESOLVE_COMPUTE_UNITS = 1_400_000;

export interface NetworkConfig {
  rpc: string;
  apiBase: string;
  txoracleProgram: PublicKey;
  usdtMint: PublicKey;
  txlMint: PublicKey;
}

export const DEVNET: NetworkConfig = {
  rpc: "https://api.devnet.solana.com",
  apiBase: "https://txline-dev.txodds.com",
  txoracleProgram: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
  usdtMint: new PublicKey("ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"),
  txlMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
};

export const MAINNET: NetworkConfig = {
  rpc: "https://api.mainnet-beta.solana.com",
  apiBase: "https://txline.txodds.com",
  txoracleProgram: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
  usdtMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  txlMint: new PublicKey("11111111111111111111111111111111"),
};

// Soccer stat-key encoding: stat_key = period + base_key.
export const STAT_BASE = {
  p1Goals: 1,
  p2Goals: 2,
  p1Yellow: 3,
  p2Yellow: 4,
  p1Red: 5,
  p2Red: 6,
  p1Corners: 7,
  p2Corners: 8,
} as const;

export const PERIOD = {
  full: 0,
  h1: 1000,
  h2: 2000,
  et1: 3000,
  et2: 4000,
  pe: 5000,
} as const;

export function statKey(base: number, period = 0): number {
  return period + base;
}
