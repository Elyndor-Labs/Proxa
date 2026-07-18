"use client";

import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import { WalletButton } from "@/components/domain/wallet-button";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="wallet-empty-center">
      <EmptyState
        icon={Wallet}
        title="Connect your wallet"
        description="Sign in with email, social, or a Solana wallet to view your portfolio and place bets."
        action={<WalletButton size="lg" />}
      />
    </div>
  );
}
