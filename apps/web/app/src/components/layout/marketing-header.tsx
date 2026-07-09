"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/domain/wallet-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Public marketing header — top nav only, no sidebar. */
export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-4 px-[var(--container-padding)] sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-lg font-bold tracking-tight sm:text-xl">
          {siteConfig.name.toUpperCase()}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-label text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <Button variant="brand" size="sm" asChild>
            <Link href="/markets">Launch App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
