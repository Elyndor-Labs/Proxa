import { BorshCoder, EventParser, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export type ProxaEventName = "marketCreated" | "betPlaced" | "marketResolved" | "claimed";

export interface ProxaEvent {
  name: string;
  data: Record<string, unknown>;
}

export function parseEvents(programId: PublicKey, idl: Idl, logs: string[]): ProxaEvent[] {
  const parser = new EventParser(programId, new BorshCoder(idl));
  return [...parser.parseLogs(logs)].map((event) => ({
    name: event.name,
    data: event.data as Record<string, unknown>,
  }));
}
