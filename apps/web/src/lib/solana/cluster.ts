export type Cluster = "devnet" | "mainnet-beta";

const STORAGE_KEY = "proxa-cluster";

const RPC_ENDPOINTS: Record<Cluster, string> = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
};

/** Default cluster from build-time env. */
export function getDefaultCluster(): Cluster {
  return (process.env.NEXT_PUBLIC_CLUSTER as Cluster | undefined) ?? "devnet";
}

/** Reads persisted cluster preference (client only). */
export function getStoredCluster(): Cluster | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "devnet" || stored === "mainnet-beta") return stored;
  return null;
}

/** Resolves RPC URL for a cluster, preferring env override for the default cluster. */
export function getRpcForCluster(cluster: Cluster): string {
  const envRpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
  if (envRpc && cluster === getDefaultCluster()) return envRpc;
  return RPC_ENDPOINTS[cluster];
}

/** Persists cluster preference (client only). */
export function persistCluster(cluster: Cluster) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, cluster);
}

export { STORAGE_KEY };
