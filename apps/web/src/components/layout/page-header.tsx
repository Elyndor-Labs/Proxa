import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

/** Page title block with gradient heading and motion. */
export function PageHeader({ title, description, actions, icon: Icon, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "animate-slide-up mb-8 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="page-title-icon" aria-hidden>
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
          )}
          <h1 className="page-title">{title}</h1>
        </div>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
