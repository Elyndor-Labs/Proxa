"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";

function safePublicKey(address: string): PublicKey | null {
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

/** Privy auth + Solana wallet state for UI components. */
export function useWalletAuth() {
  const { ready: privyReady, authenticated, login, logout, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const ready = privyReady && walletsReady;
  const publicKey = wallets[0] ? safePublicKey(wallets[0].address) : null;
  const connected = ready && authenticated && publicKey !== null;

  return {
    ready,
    connected,
    publicKey,
    login,
    logout,
    user,
  };
}
