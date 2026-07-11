"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Cluster } from "@/config/solana";
import {
  getDefaultCluster,
  getRpcForCluster,
  getStoredCluster,
  persistCluster,
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
  // Match SSR on first paint; restore persisted choice after hydration.
  const [cluster, setClusterState] = useState<Cluster>(() => getDefaultCluster());

  useEffect(() => {
    const stored = getStoredCluster();
    if (stored) setClusterState(stored);
  }, []);

  const setCluster = useCallback(
    (next: Cluster) => {
      persistCluster(next);
      setClusterState(next);
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
