"use client";

import { PrivyAnchorWalletBridge } from "@/components/providers/privy-anchor-bridge";
import { PrivyAuthProvider } from "@/components/providers/privy-provider";
import { SolanaProvider } from "@/components/providers/solana-provider";

/** Wallet + RPC providers — loaded at root for unified navigation. */
export function AppWalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider>
      <SolanaProvider>
        <PrivyAnchorWalletBridge>{children}</PrivyAnchorWalletBridge>
      </SolanaProvider>
    </PrivyAuthProvider>
  );
}
