"use client";

import { Bell, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { truncateAddress } from "@/lib/format/address";
import { cn } from "@/lib/utils";

/** Disconnect external Solana wallet after Privy logout. */
async function disconnectExternalSolanaWallet() {
  const provider = (window as Window & { solana?: { disconnect?: () => Promise<void> } }).solana;
  if (!provider?.disconnect) return;
  try {
    await provider.disconnect();
  } catch {
    // Extension may already be disconnected.
  }
}

interface UserMenuProps {
  className?: string;
}

/** User dropdown with profile link and disconnect action. */
export function UserMenu({ className }: UserMenuProps) {
  const mounted = useMounted();
  const { ready, connected, publicKey, login, logout } = useWalletAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!mounted || !ready) {
    return (
      <Button type="button" variant="outline" size="sm" disabled aria-hidden tabIndex={-1}>
        Login
      </Button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => login()} className={cn("border-border/60", className)}>
        Login
      </Button>
    );
  }

  const displayName = truncateAddress(publicKey.toBase58(), 4);

  return (
    <div ref={menuRef} className={cn("relative flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-label text-sm transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 text-xs font-medium text-brand">
          {displayName.slice(1, 2).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        type="button"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-lg"
        >
          <Link
            href="/portfolio"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 font-label text-sm text-foreground transition-colors hover:bg-muted"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            My Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              await disconnectExternalSolanaWallet();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 font-label text-sm text-destructive transition-colors hover:bg-muted"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
