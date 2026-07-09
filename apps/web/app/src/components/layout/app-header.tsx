"use client";

import { Menu, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { WalletButton } from "@/components/domain/wallet-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** App shell top bar with search, wallet, and mobile menu trigger. */
export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/dashboard" className="font-display text-base font-bold md:hidden">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-4 lg:flex" aria-label="Primary">
          {primaryNav.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-label text-sm text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search markets, ids, or users…" aria-label="Search" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <WalletButton />
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
    </>
  );
}
