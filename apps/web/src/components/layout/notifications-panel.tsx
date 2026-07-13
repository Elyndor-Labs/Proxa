"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

/** Dropdown panel listing wallet notifications from the API. */
export function NotificationsPanel({ open, onClose, className }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute top-[calc(100%+0.5rem)] right-0 z-50 w-80 overflow-hidden rounded-xl",
        className,
      )}
      style={{
        border: "1px solid var(--header-border-hover)",
        backgroundColor: "var(--popover)",
        boxShadow: "0 12px 40px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between border-b border-[var(--header-border)] px-4 py-3">
        <p className="font-label text-sm font-semibold">Notifications</p>
        {unreadCount > 0 && (
          <span className="rounded-full bg-brand/15 px-2 py-0.5 font-label text-[10px] font-semibold text-brand">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <p className="px-4 py-6 text-center font-label text-sm text-muted-foreground">Loading…</p>
        ) : !notifications?.length ? (
          <p className="px-4 py-6 text-center font-label text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => {
                if (!notification.read) {
                  markRead.mutate(notification.id);
                }
                onClose();
              }}
              className={cn(
                "block w-full border-b border-[var(--header-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--nav-link-hover-bg)]",
                !notification.read && "bg-brand/5",
              )}
            >
              <p className="font-label text-sm text-foreground">{notification.message}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="font-label text-[11px] text-muted-foreground">
                  {formatWhen(notification.createdAt)}
                </span>
                <Link
                  href={`/markets/${notification.marketId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-label text-[11px] text-brand hover:underline"
                >
                  View market
                </Link>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
