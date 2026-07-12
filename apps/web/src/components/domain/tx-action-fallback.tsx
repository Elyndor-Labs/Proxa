"use client";

import { isApiEnabled } from "@/config/api";
import { WalletButton } from "@/components/domain/wallet-button";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

interface TxActionFallbackProps {
  size?: "default" | "sm" | "lg";
}

/** Shown when bet/claim actions are unavailable — connect wallet or read-only test mode. */
export function TxActionFallback({ size = "lg" }: TxActionFallbackProps) {
  const { connected } = useWalletAuth();

  if (connected && isApiEnabled()) {
    return (
      <p
        role="status"
        className="rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-center font-label text-xs text-muted-foreground sm:text-sm"
      >
        Test mode — on-chain transactions are read-only.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <WalletButton size={size} />
    </div>
  );
}
