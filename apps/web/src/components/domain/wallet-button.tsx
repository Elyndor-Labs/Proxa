"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { truncateAddress } from "@/lib/format/address";

interface WalletButtonProps {
  size?: "default" | "sm" | "lg";
}

/** Disconnect Phantom/Solflare after Privy logout to avoid stale SIWS state. */
async function disconnectExternalSolanaWallet() {
  const provider = (window as Window & { solana?: { disconnect?: () => Promise<void> } }).solana;
  if (!provider?.disconnect) return;
  try {
    await provider.disconnect();
  } catch {
    // Ignore — extension may already be disconnected.
  }
}

/** Connect / disconnect control backed by Privy auth. */
export function WalletButton({ size = "default" }: WalletButtonProps) {
  const mounted = useMounted();
  const { ready, connected, publicKey, login, logout } = useWalletAuth();

  if (!mounted || !ready) {
    return (
      <Button type="button" variant="brand" size={size} disabled aria-hidden tabIndex={-1}>
        Connect Wallet
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={async () => {
          await logout();
          await disconnectExternalSolanaWallet();
        }}
        className="gap-2 font-mono"
        aria-label="Disconnect wallet"
      >
        {truncateAddress(publicKey.toBase58())}
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <Button type="button" variant="brand" size={size} onClick={() => login()}>
      Connect Wallet
    </Button>
  );
}
