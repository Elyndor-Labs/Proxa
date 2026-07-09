export type Cluster = "devnet" | "mainnet-beta";

const cluster = (process.env.NEXT_PUBLIC_CLUSTER as Cluster | undefined) ?? "devnet";

const RPC_ENDPOINTS: Record<Cluster, string> = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
};

/** Solana network configuration resolved from environment. */
export const solanaConfig = {
  cluster,
  rpc: process.env.NEXT_PUBLIC_SOLANA_RPC ?? RPC_ENDPOINTS[cluster],
} as const;
