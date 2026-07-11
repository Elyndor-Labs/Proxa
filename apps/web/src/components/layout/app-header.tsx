"use client";

import { Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ClusterSwitcher } from "@/components/domain/cluster-switcher";
import { WalletButton } from "@/components/domain/wallet-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** App shell top bar with search, wallet, and mobile menu trigger. */
export function AppHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const trapRef = useFocusTrap<HTMLDivElement>(mobileOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    setSearchOpen(false);
    router.push(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
  };

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

        <form onSubmit={handleSearch} className="relative mx-auto hidden max-w-md flex-1 md:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search markets, ids, or fixtures…"
            aria-label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <ClusterSwitcher className="hidden sm:inline-flex" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search markets"
            aria-expanded={searchOpen}
          >
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <WalletButton />
        </div>
      </header>

      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="border-b border-border bg-background px-4 py-2 md:hidden"
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search markets…"
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

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
          ref={trapRef}
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
