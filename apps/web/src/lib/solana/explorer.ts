import type { Cluster } from "@/config/solana";
import { getDefaultCluster, getStoredCluster } from "@/lib/solana/cluster";

function resolveCluster(): Cluster {
  return getStoredCluster() ?? getDefaultCluster();
}

/** Solana Explorer URL for a confirmed transaction signature. */
export function txExplorerUrl(signature: string, cluster?: Cluster): string {
  const active = cluster ?? resolveCluster();
  const base = `https://explorer.solana.com/tx/${signature}`;
  if (active === "mainnet-beta") return base;
  return `${base}?cluster=${active}`;
}

export function openTxExplorer(signature: string, cluster?: Cluster): void {
  window.open(txExplorerUrl(signature, cluster), "_blank", "noopener,noreferrer");
}
