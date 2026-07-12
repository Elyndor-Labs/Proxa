"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PortfolioCash } from "@/components/layout/portfolio-cash";
import { UserMenu } from "@/components/layout/user-menu";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { isMockDemo } from "@/config/api";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Unified top navigation — mentioned.market-inspired polish. */
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
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: "var(--header-surface)",
          boxShadow: "var(--header-shadow)",
          borderBottom: "1px solid var(--header-border)",
        }}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width)] items-center gap-4 px-[var(--container-padding)] sm:gap-5 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="nav-brand shrink-0">
            <span className="nav-brand-mark" aria-hidden>
              {siteConfig.name.charAt(0)}
            </span>
            <span>{siteConfig.name}</span>
          </Link>

          <span className="nav-divider hidden lg:block" aria-hidden />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search — grows between nav and actions */}
          <form
            onSubmit={handleSearch}
            className="relative ml-auto hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm xl:max-w-md"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search markets…"
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nav-search"
            />
          </form>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <PortfolioCash />

            <UserMenu />

            {isMockDemo() && (
              <span
                className="hidden rounded-md border px-2 py-1 font-label text-[10px] font-semibold uppercase tracking-wider sm:inline"
                style={{
                  borderColor: "rgba(74, 222, 128, 0.25)",
                  backgroundColor: "rgba(74, 222, 128, 0.08)",
                  color: "var(--brand)",
                }}
              >
                Test
              </span>
            )}

            <button
              type="button"
              className="nav-icon-btn lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
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
            "absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
        <nav
          ref={trapRef}
          className={cn(
            "absolute top-0 right-0 flex h-full w-80 flex-col border-l p-5 shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          style={{
            borderColor: "var(--header-border)",
            backgroundColor: "var(--popover)",
          }}
          aria-label="Mobile"
        >
          <div className="mb-5 flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="nav-brand">
              <span className="nav-brand-mark" aria-hidden>
                {siteConfig.name.charAt(0)}
              </span>
              <span>{siteConfig.name}</span>
            </Link>
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative mb-5">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search markets…"
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nav-search"
            />
          </form>

          <div className="flex flex-col gap-0.5">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                data-active={isActive(item.href)}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
