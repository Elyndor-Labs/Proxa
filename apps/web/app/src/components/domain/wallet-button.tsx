"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/format/address";

interface WalletButtonProps {
  size?: "default" | "sm" | "lg";
}

/** Connect / disconnect wallet control styled for the Velocity Grid design system. */
export function WalletButton({ size = "default" }: WalletButtonProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => disconnect()}
        className="gap-2 font-mono"
        aria-label="Disconnect wallet"
      >
        {truncateAddress(publicKey.toBase58())}
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <Button type="button" variant="brand" size={size} onClick={() => setVisible(true)}>
      Connect Wallet
    </Button>
  );
}
