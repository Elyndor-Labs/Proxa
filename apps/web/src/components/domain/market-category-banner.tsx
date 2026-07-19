import type { CSSProperties, ReactNode } from "react";
import { createElement } from "react";
import { marketBannerHues, marketCategoryIcon } from "@/lib/format/market-category";
import { cn } from "@/lib/utils";

interface MarketCategoryBannerProps {
  fixtureId: string;
  statLabel: string;
  className?: string;
  size?: "sm" | "lg";
  children?: ReactNode;
}

/** Category graphic on a colored gradient — no initial-circle avatars. */
export function MarketCategoryBanner({
  fixtureId,
  statLabel,
  className,
  size = "sm",
  children,
}: MarketCategoryBannerProps) {
  const { a, b } = marketBannerHues(fixtureId);
  const style: CSSProperties = {
    background: `
      radial-gradient(ellipse 80% 100% at 85% 20%, hsla(${a}, 50%, 28%, 0.45), transparent 55%),
      radial-gradient(ellipse 70% 90% at 10% 90%, hsla(${b}, 45%, 22%, 0.4), transparent 50%),
      linear-gradient(145deg, hsla(${a}, 35%, 12%, 1) 0%, #0a0d0a 50%, hsla(${b}, 30%, 11%, 1) 100%)
    `,
  };

  return (
    <div
      className={cn(
        "market-category-banner",
        size === "lg" && "market-category-banner--lg",
        className,
      )}
      style={style}
    >
      <div className="market-category-banner__mesh" aria-hidden />
      {createElement(marketCategoryIcon(statLabel), {
        className: "market-category-banner__icon",
        "aria-hidden": true,
        strokeWidth: 1.25,
      })}
      {children && <div className="market-category-banner__content">{children}</div>}
    </div>
  );
}
