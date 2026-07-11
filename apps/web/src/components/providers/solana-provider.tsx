"use client";

import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";
import { useCluster } from "@/components/providers/cluster-provider";

interface SolanaProviderProps {
  children: React.ReactNode;
}

/** Solana connection + multi-wallet adapter context. */
export function SolanaProvider({ children }: SolanaProviderProps) {
  const { cluster, rpc } = useCluster();
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new BackpackWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider key={`${cluster}-${rpc}`} endpoint={rpc}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
