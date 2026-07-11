import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { DEVNET, MAINNET, ProxaClient } from "@proxa/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

function loadKeypair(): Keypair {
  const p = process.env.KEEPER_KEYPAIR ?? `${homedir()}/.config/solana/id.json`;
  const secret = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
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
