"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClusterSwitcher } from "@/components/domain/cluster-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { isMockDemo } from "@/config/api";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { launchAppLabel } from "@/features/landing/mock-demo-cta";
import { cn } from "@/lib/utils";

/** Public marketing header — top nav only, no sidebar. */
export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const trapRef = useFocusTrap<HTMLElement>(mobileOpen);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-4 px-[var(--container-padding)] sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight sm:text-xl">
            {siteConfig.name.toUpperCase()}
            {isMockDemo() ? (
              <span className="rounded bg-brand/20 px-1.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-brand">
                Test
              </span>
            ) : null}
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
            <ClusterSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/markets">Connect Wallet</Link>
            </Button>
            <Button variant="brand" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/markets">{launchAppLabel()}</Link>
            </Button>
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
          </div>
        </div>
      </header>

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
        <nav
          ref={trapRef}
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 flex-col gap-1 border-l border-border bg-background p-4 shadow-xl transition-transform",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display font-bold">{siteConfig.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 font-label text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto space-y-2 border-t border-border pt-4">
            <Button variant="outline" className="w-full" size="sm" asChild>
              <Link href="/markets" onClick={() => setMobileOpen(false)}>
                Connect Wallet
              </Link>
            </Button>
            <Button variant="brand" className="w-full" size="sm" asChild>
              <Link href="/markets" onClick={() => setMobileOpen(false)}>
                {launchAppLabel()}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
