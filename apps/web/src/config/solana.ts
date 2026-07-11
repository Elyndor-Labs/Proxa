import type { Cluster } from "@/lib/solana/cluster";
import { getDefaultCluster, getRpcForCluster } from "@/lib/solana/cluster";

export type { Cluster };

/** Solana network configuration — defaults from env; runtime override via ClusterProvider. */
export const solanaConfig = {
  cluster: getDefaultCluster(),
  rpc: getRpcForCluster(getDefaultCluster()),
} as const;
