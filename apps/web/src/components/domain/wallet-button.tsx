"use client";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

interface WalletButtonProps {
  size?: "default" | "sm" | "lg";
}

/** Connect / disconnect control backed by Privy auth. */
export function WalletButton({ size = "default" }: WalletButtonProps) {
  const mounted = useMounted();
  const { ready, connected, login } = useWalletAuth();

  if (!mounted || !ready) {
    return (
      <Button type="button" variant="outline" size={size} disabled aria-hidden tabIndex={-1}>
        Login
      </Button>
    );
  }

  if (connected) return null;

  return (
    <Button type="button" variant="outline" size={size} onClick={() => login()} className="border-border/60">
      Login
    </Button>
  );
}
