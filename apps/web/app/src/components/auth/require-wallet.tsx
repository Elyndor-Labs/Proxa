"use client";

import type { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/domain/wallet-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RequireWalletProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when a wallet is connected. */
export function RequireWallet({ children, fallback }: RequireWalletProps) {
  const { connected } = useWallet();

  if (!connected) {
    return fallback ?? <ConnectPrompt />;
  }

  return children;
}

function ConnectPrompt() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Connect your wallet</CardTitle>
        <CardDescription>A Solana wallet is required to view your portfolio and place bets.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <WalletButton size="lg" />
      </CardContent>
    </Card>
  );
}
