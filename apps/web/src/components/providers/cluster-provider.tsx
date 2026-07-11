"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Cluster } from "@/config/solana";
import {
  getClusterSnapshot,
  getDefaultCluster,
  getRpcForCluster,
  persistCluster,
  subscribeCluster,
} from "@/lib/solana/cluster";

interface ClusterContextValue {
  cluster: Cluster;
  rpc: string;
  setCluster: (cluster: Cluster) => void;
}

const ClusterContext = createContext<ClusterContextValue | null>(null);

/** Runtime cluster selection with localStorage persistence. */
export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const cluster = useSyncExternalStore(
    subscribeCluster,
    getClusterSnapshot,
    getDefaultCluster,
  );

  const setCluster = useCallback(
    (next: Cluster) => {
      persistCluster(next);
      queryClient.clear();
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      cluster,
      rpc: getRpcForCluster(cluster),
      setCluster,
    }),
    [cluster, setCluster],
  );

  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>;
}

/** Access the active Solana cluster and RPC endpoint. */
export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}
