"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PortfolioCash } from "@/components/layout/portfolio-cash";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { isMockDemo } from "@/config/api";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Unified top navigation with project name, inline search, and dark styling. */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const trapRef = useFocusTrap<HTMLElement>(mobileOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    setMobileOpen(false);
    router.push(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width)] items-center gap-3 px-[var(--container-padding)] sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 font-display text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {siteConfig.name}
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-label text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="relative ml-auto hidden w-36 md:block lg:w-44 xl:w-52">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search markets…"
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-border/60 bg-muted/50 pr-3 pl-8 font-label text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-brand/40 focus:bg-muted focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </form>

          <div className="flex items-center gap-2">
            <PortfolioCash />

            <UserMenu />

            {isMockDemo() && (
              <span className="hidden rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 font-label text-[10px] font-medium uppercase tracking-wider text-brand sm:inline">
                Test
              </span>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
        <nav
          ref={trapRef}
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 flex-col gap-1 border-l border-border bg-popover p-4 shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile"
        >
          <div className="mb-4 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="font-display font-bold">
              {siteConfig.name}
            </Link>
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

          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search markets…"
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-muted/50 pr-3 pl-8 font-label text-sm placeholder:text-muted-foreground focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
          </form>

          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 font-label text-sm transition-colors",
                isActive(item.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
