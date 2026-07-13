"use client";

import { WalletButton } from "@/components/domain/wallet-button";

interface TxActionFallbackProps {
  size?: "default" | "sm" | "lg";
}

/** Shown when bet/claim actions need a connected wallet. */
export function TxActionFallback({ size = "lg" }: TxActionFallbackProps) {
  return (
    <div className="flex justify-center">
      <WalletButton size={size} />
    </div>
  );
}
