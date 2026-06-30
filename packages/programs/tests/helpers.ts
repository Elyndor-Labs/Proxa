import { BorshCoder, EventParser, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import assert from "assert";

export const txlineReady = Boolean(process.env.TXLINE_JWT && process.env.TXLINE_API_TOKEN);

export async function parseTransactionEvents(
  program: Program<any>,
  connection: Connection,
  signature: string,
) {
  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  assert.ok(tx?.meta?.logMessages, "transaction logs missing");
  const parser = new EventParser(program.programId, new BorshCoder(program.idl!));
  return [...parser.parseLogs(tx.meta.logMessages)];
}

export function findEvent(events: { name: string; data: Record<string, unknown> }[], name: string) {
  const event = events.find((entry) => entry.name === name);
  assert.ok(event, `expected ${name} event`);
  return event;
}
