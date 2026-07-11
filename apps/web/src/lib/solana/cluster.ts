export type Cluster = "devnet" | "mainnet-beta";

const STORAGE_KEY = "proxa-cluster";

export const CLUSTER_CHANGE_EVENT = "proxa-cluster-change";

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

/** Active cluster on the client, falling back to the build default. */
export function getActiveCluster(): Cluster {
  return getStoredCluster() ?? getDefaultCluster();
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
  window.dispatchEvent(new Event(CLUSTER_CHANGE_EVENT));
}

export { STORAGE_KEY };
