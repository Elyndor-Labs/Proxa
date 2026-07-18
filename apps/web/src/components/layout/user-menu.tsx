"use client";

import { Bell, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/domain/user-avatar";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { useMounted } from "@/hooks/use-mounted";
import { useNotifications } from "@/hooks/use-notifications";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { isApiEnabled } from "@/config/api";
import { truncateAddress } from "@/lib/format/address";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  className?: string;
}

/** User dropdown with profile link and disconnect action. */
export function UserMenu({ className }: UserMenuProps) {
  const mounted = useMounted();
  const { ready, connected, publicKey, login, logout } = useWalletAuth();
  const { data: notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const showNotifications = isApiEnabled();

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
      <button type="button" className="nav-login opacity-50" disabled aria-hidden tabIndex={-1}>
        Login
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <button type="button" className={cn("nav-login", className)} onClick={() => void login()}>
        Login
      </button>
    );
  }

  const displayName = truncateAddress(publicKey.toBase58(), 4);

  return (
    <div ref={menuRef} className={cn("relative flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="nav-link gap-2 !py-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar size={28} className="user-avatar--nav" alt="" />
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {showNotifications && (
        <div className="relative">
          <button
            type="button"
            className="nav-icon-btn relative"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((prev) => !prev)}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 font-label text-[9px] font-bold text-brand-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>
      )}

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-52 overflow-hidden rounded-xl py-1"
          style={{
            border: "1px solid var(--header-border-hover)",
            backgroundColor: "var(--popover)",
            boxShadow: "0 12px 40px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 font-label text-sm text-foreground transition-colors hover:bg-[var(--nav-link-hover-bg)]"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            My Profile
          </Link>
          <div className="mx-3 my-1 h-px bg-[var(--header-border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-label text-sm text-destructive transition-colors hover:bg-[var(--nav-link-hover-bg)]"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
