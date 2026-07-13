import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { DEVNET, MAINNET, ProxaClient } from "@proxa/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

function keypairFromBytes(secret: unknown): Keypair {
  if (!Array.isArray(secret)) {
    throw new Error("Keypair secret must be a JSON array of bytes.");
  }

  if (secret.length !== 64 || !secret.every((byte) => Number.isInteger(byte))) {
    throw new Error("Keypair secret must contain 64 integer bytes.");
  }

  return Keypair.fromSecretKey(Uint8Array.from(secret as number[]));
}

function keypairFromSource(source: string): Keypair {
  const value = source.trim();

  if (value.startsWith("[")) {
    return keypairFromBytes(JSON.parse(value));
  }

  return keypairFromBytes(JSON.parse(readFileSync(value, "utf8")));
}

function loadKeypair(): Keypair {
  if (process.env.KEEPER_KEYPAIR_JSON) {
    return keypairFromBytes(JSON.parse(process.env.KEEPER_KEYPAIR_JSON));
  }

  const p = process.env.KEEPER_KEYPAIR ?? `${homedir()}/.config/solana/id.json`;
  return keypairFromSource(p);
}

export function createClient(): ProxaClient {
  const network =
    (process.env.PROXA_NETWORK ?? "devnet").toLowerCase() === "mainnet"
      ? MAINNET
      : DEVNET;
  const rpc = process.env.RPC_URL ?? network.rpc;
  const keypair = loadKeypair();
  const connection = new Connection(rpc, "confirmed");
  const provider = new AnchorProvider(
    connection,
    new Wallet(keypair),
    { commitment: "confirmed" }
  );
  return new ProxaClient(provider, { network });
}

export const proxaClient = createClient();
