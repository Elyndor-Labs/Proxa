import type { ProxaClient } from "@proxa/sdk";
import { LAMPORTS_PER_SOL, Transaction, type TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { createAtaInstructionIfNeeded } from "@/lib/solana/ata";

const MIN_SOL_FOR_TX_FEES = 0.002;

interface SendTxParams {
  client: ProxaClient;
  payer: PublicKey;
  stakeMint: PublicKey;
  tokenProgram: PublicKey;
  instructions: TransactionInstruction[];
}

/** Builds a transaction with optional ATA creation, then signs and sends. */
export async function sendStakeTransaction({
  client,
  payer,
  stakeMint,
  tokenProgram,
  instructions,
}: SendTxParams): Promise<string> {
  const solBalance = await client.connection.getBalance(payer, "confirmed");
  if (solBalance < MIN_SOL_FOR_TX_FEES * LAMPORTS_PER_SOL) {
    throw new Error(
      `This wallet needs SOL for Solana network fees. Add at least ${MIN_SOL_FOR_TX_FEES} SOL, then retry.`,
    );
  }

  const tx = new Transaction();

  const ataIx = await createAtaInstructionIfNeeded(
    client.connection,
    payer,
    stakeMint,
    payer,
    tokenProgram,
  );
  if (ataIx) tx.add(ataIx);
  instructions.forEach((ix) => tx.add(ix));

  return client.provider.sendAndConfirm(tx);
}
