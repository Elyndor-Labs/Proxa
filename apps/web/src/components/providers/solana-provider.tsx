"use client";

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { useCluster } from "@/components/providers/cluster-provider";

interface SolanaProviderProps {
  children: React.ReactNode;
}

/** Solana RPC connection context. Wallet signing is handled by Privy. */
export function SolanaProvider({ children }: SolanaProviderProps) {
  const { cluster, rpc } = useCluster();

  return (
    <ConnectionProvider key={`${cluster}-${rpc}`} endpoint={rpc}>
      {children}
    </ConnectionProvider>
  );
}
