import { DEVNET, MAINNET, NetworkConfig } from "@proxa/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

export interface KeeperConfig {
  connection: Connection;
  keypair: Keypair;
  network: NetworkConfig;
}

export function loadKeypair(path?: string): Keypair {
  const p = path ?? process.env.KEEPER_KEYPAIR ?? `${homedir()}/.config/solana/id.json`;
  const secret = JSON.parse(readFileSync(p, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function loadConfig(): KeeperConfig {
  const network = (process.env.PROXA_NETWORK ?? "devnet").toLowerCase() === "mainnet" ? MAINNET : DEVNET;
  const rpc = process.env.RPC_URL ?? network.rpc;
  return {
    connection: new Connection(rpc, "confirmed"),
    keypair: loadKeypair(),
    network,
  };
}
