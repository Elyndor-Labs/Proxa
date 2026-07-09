"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

/** App shell sidebar navigation. */
export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-[var(--sidebar-width)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      <div className="border-b border-sidebar-border p-4">
        <Link href="/" className="font-display text-lg font-bold" onClick={onNavigate}>
          {siteConfig.name}
        </Link>
        <p className="font-label text-xs text-muted-foreground">Decentralized Protocol</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="App">
        {appNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-label text-sm transition-colors",
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button variant="brand" className="w-full" asChild>
          <Link href="/markets" onClick={onNavigate}>
            Place New Prop
          </Link>
        </Button>
      </div>
    </aside>
  );
}
