"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GooeyInput } from "@/components/ui/gooey-input";
import { PortfolioCash } from "@/components/layout/portfolio-cash";
import { UserMenu } from "@/components/layout/user-menu";
import { useMounted } from "@/hooks/use-mounted";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Unified top navigation — mentioned.market-inspired polish. */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { ready, connected } = useWalletAuth();
  const [search, setSearch] = useState("");

  const submitSearch = () => {
    const q = search.trim();
    router.push(q ? `/markets?q=${encodeURIComponent(q)}` : "/markets");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
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

        {/* Gooey search */}
        <div className="relative ml-auto hidden min-w-0 md:block">
          <GooeyInput
            value={search}
            onValueChange={setSearch}
            onSubmit={submitSearch}
            placeholder="Search markets…"
            collapsedWidth={130}
            expandedWidth={260}
            expandedOffset={48}
            className="justify-end"
          />
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <PortfolioCash />
          <UserMenu />
        </div>
      </div>

      {/* Mobile nav strip when logged out */}
      {mounted && ready && !connected && (
        <nav
          className="flex gap-1 overflow-x-auto border-t px-[var(--container-padding)] py-2 sm:px-6 lg:hidden"
          style={{ borderColor: "var(--header-border)" }}
          aria-label="Primary"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              className="nav-link shrink-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
