"use client";

import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { usePrivyAnchorWallet } from "@/components/providers/privy-anchor-bridge";

/** Drop-in replacement for wallet-adapter's useAnchorWallet, backed by Privy. */
export function useAnchorWallet(): AnchorWallet | undefined {
  const wallet = usePrivyAnchorWallet();
  return wallet ?? undefined;
}
