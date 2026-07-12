import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Public marketing footer — mentioned.market style. */
export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--container-padding)] py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          {footerNav.social.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {footerNav.legal.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>·</span>}
              <Link href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </span>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
          This is not financial advice. Trading involves risk of loss. Only trade with funds you can afford to lose.
        </p>

        <p className="mt-4 text-center font-label text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
