import { Wallet } from "@coral-xyz/anchor";
import { ProxaClient } from "@proxa/sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getNetworkConfig } from "@/lib/proxa/network";
import type { Cluster } from "@/config/solana";

const READ_ONLY_WALLET = {
  publicKey: PublicKey.default,
  signTransaction<T extends Transaction | VersionedTransaction>(): Promise<T> {
    return Promise.reject(new Error("Wallet not connected"));
  },
  signAllTransactions<T extends Transaction | VersionedTransaction>(): Promise<T[]> {
    return Promise.reject(new Error("Wallet not connected"));
  },
} as unknown as Wallet;

/** Read-only client for public on-chain queries. */
export function createReadOnlyClient(connection: Connection, cluster: Cluster): ProxaClient {
  const provider = new AnchorProvider(connection, READ_ONLY_WALLET, {
    commitment: "confirmed",
  });
  return new ProxaClient(provider, { network: getNetworkConfig(cluster) });
}

/** Client bound to a connected wallet for signing transactions. */
export function createWalletClient(
  connection: Connection,
  wallet: AnchorWallet,
  cluster: Cluster,
): ProxaClient {
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  return new ProxaClient(provider, { network: getNetworkConfig(cluster) });
}
