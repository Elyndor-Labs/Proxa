import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";

/** Returns a create-ATA instruction when the token account does not exist. */
export async function createAtaInstructionIfNeeded(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgram: PublicKey,
): Promise<TransactionInstruction | null> {
  const ata = getAssociatedTokenAddressSync(mint, owner, false, tokenProgram);
  const account = await connection.getAccountInfo(ata);
  if (account) return null;

  return createAssociatedTokenAccountInstruction(payer, ata, owner, mint, tokenProgram);
}
