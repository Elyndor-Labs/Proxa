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
  window.dispatchEvent(new Event(CLUSTER_CHANGE_EVENT));
}

export const CLUSTER_CHANGE_EVENT = "proxa-cluster-change";

/** Subscribe to cluster changes from this tab or other tabs. */
export function subscribeCluster(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener("storage", handler);
  window.addEventListener(CLUSTER_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CLUSTER_CHANGE_EVENT, handler);
  };
}

/** Current cluster for client renders. */
export function getClusterSnapshot(): Cluster {
  return getStoredCluster() ?? getDefaultCluster();
}

export { STORAGE_KEY };
