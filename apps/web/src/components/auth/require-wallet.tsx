"use client";

import type { ReactNode } from "react";
import { WalletButton } from "@/components/domain/wallet-button";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

interface RequireWalletProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when a wallet is connected via Privy. */
export function RequireWallet({ children, fallback }: RequireWalletProps) {
  const { connected } = useWalletAuth();

  if (!connected) {
    return fallback ?? <ConnectPrompt />;
  }

  return children;
}

function ConnectPrompt() {
  return (
    <div className="surface mx-auto max-w-md p-10 text-center">
      <p className="font-display text-xl font-bold">Connect your wallet</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Sign in with email, social, or a Solana wallet to view your portfolio and place bets.
      </p>
      <div className="mt-6 flex justify-center">
        <WalletButton size="lg" />
      </div>
    </div>
  );
}
