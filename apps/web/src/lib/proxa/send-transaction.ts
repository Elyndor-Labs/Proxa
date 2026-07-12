import type { ProxaClient } from "@proxa/sdk";
import { Transaction, type TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { createAtaInstructionIfNeeded } from "@/lib/solana/ata";

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
