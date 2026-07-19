import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Breadcrumb trail for nested pages. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("breadcrumbs", className)} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="breadcrumbs__item">
              {i > 0 && (
                <ChevronRight className="breadcrumbs__sep h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className={cn("breadcrumbs__current", isLast && "breadcrumbs__current--active")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
