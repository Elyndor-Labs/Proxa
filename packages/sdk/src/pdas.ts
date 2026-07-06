import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { MS_PER_DAY, PROXA_PROGRAM_ID, SEEDS } from "./constants";

export type MarketId = number | bigint | BN;

function u64le(n: MarketId): Buffer {
  return new BN(n.toString()).toArrayLike(Buffer, "le", 8);
}

function toMs(ts: number | bigint | BN): number {
  return typeof ts === "number" ? ts : Number(ts.toString());
}

export function configPda(programId: PublicKey = PROXA_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.config], programId);
}

export function marketPda(marketId: MarketId, programId: PublicKey = PROXA_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.market, u64le(marketId)], programId);
}

export function vaultPda(marketId: MarketId, programId: PublicKey = PROXA_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.vault, u64le(marketId)], programId);
}

export function positionPda(
  market: PublicKey,
  bettor: PublicKey,
  bucket: number,
  programId: PublicKey = PROXA_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.position, market.toBuffer(), bettor.toBuffer(), Buffer.from([bucket])],
    programId,
  );
}

export function epochDay(tsMs: number | bigint | BN): number {
  return Math.floor(toMs(tsMs) / MS_PER_DAY);
}

// Daily-scores roots PDA under txoracle: seeds = ["daily_scores_roots", epochDay as u16 LE].
export function dailyScoresRootsPda(tsMs: number | bigint | BN, txoracleProgram: PublicKey): [PublicKey, number] {
  const day = Buffer.alloc(2);
  day.writeUInt16LE(epochDay(tsMs) & 0xffff);
  return PublicKey.findProgramAddressSync([SEEDS.dailyScoresRoots, day], txoracleProgram);
}
