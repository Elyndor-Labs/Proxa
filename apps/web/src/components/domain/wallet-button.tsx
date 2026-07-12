"use client";

import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

interface WalletButtonProps {
  size?: "default" | "sm" | "lg";
}

/** Connect control backed by Privy auth — matches navbar login style. */
export function WalletButton({ size = "default" }: WalletButtonProps) {
  const mounted = useMounted();
  const { ready, connected, login } = useWalletAuth();

  if (!mounted || !ready) {
    return (
      <button type="button" className="nav-login opacity-50" disabled aria-hidden tabIndex={-1}>
        Login
      </button>
    );
  }

  if (connected) return null;

  return (
    <button
      type="button"
      className="nav-login"
      style={size === "lg" ? { height: "2.5rem", paddingInline: "1.5rem", fontSize: "0.875rem" } : undefined}
      onClick={() => login()}
    >
      Login
    </button>
  );
}
