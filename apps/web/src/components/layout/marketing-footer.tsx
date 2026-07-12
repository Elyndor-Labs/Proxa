import Link from "next/link";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Public marketing footer. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-[var(--container-padding)] py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <p className="font-display text-lg font-bold">{siteConfig.name}</p>
          <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        {Object.entries(footerNav).map(([section, links]) => (
          <div key={section} className="space-y-3">
            <p className="font-label text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {section}
            </p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/80 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-[var(--container-padding)] py-4 sm:px-6 lg:px-8">
        <p className="text-center font-label text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Trustless Parametric Oracle Network.
        </p>
      </div>
    </footer>
  );
}
