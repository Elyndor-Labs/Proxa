"use client";

import type { ReactNode } from "react";
import { WalletButton } from "@/components/domain/wallet-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="hover-lift mx-auto max-w-md border-border/60 bg-card/80">
      <CardHeader className="text-center">
        <CardTitle>Connect your wallet</CardTitle>
        <CardDescription>
          Sign in with email, social, or a Solana wallet to view your portfolio and place bets.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <WalletButton size="lg" />
      </CardContent>
    </Card>
  );
}
