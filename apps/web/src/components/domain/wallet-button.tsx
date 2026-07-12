"use client";

import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  size?: "default" | "sm" | "lg";
  className?: string;
}

/** Connect control backed by Privy auth — matches navbar login style. */
export function WalletButton({ size = "default", className }: WalletButtonProps) {
  const mounted = useMounted();
  const { ready, connected, login } = useWalletAuth();

  if (!mounted || !ready) {
    return (
      <button type="button" className={cn("nav-login w-full opacity-50", className)} disabled aria-hidden tabIndex={-1}>
        Login to trade
      </button>
    );
  }

  if (connected) return null;

  return (
    <button
      type="button"
      className={cn("nav-login w-full", className)}
      style={size === "lg" ? { padding: "0.9375rem 1.5rem", fontSize: "0.9375rem" } : undefined}
      onClick={() => login()}
    >
      Login to trade
    </button>
  );
}
