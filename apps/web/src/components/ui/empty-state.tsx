"use client";

import type { LucideIcon } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { motion } from "motion/react";
import { emptyStateIcon } from "@/lib/motion/transitions";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  /** Built-in illustration for common empty states (e.g. payout claims). */
  illustration?: "payout";
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

/** Contained empty state — compact padding, gentle icon motion on mount. */
export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) {
  const IllustrationIcon = illustration === "payout" ? CircleDollarSign : Icon;

  return (
    <div className={cn("empty-state", compact && "empty-state--compact", className)}>
      {IllustrationIcon && (
        <motion.div
          className={cn(
            "empty-state__icon",
            illustration === "payout" && "empty-state__icon--payout",
          )}
          aria-hidden
          initial={emptyStateIcon.initial}
          animate={emptyStateIcon.animate}
          transition={emptyStateIcon.transition}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
          >
            <IllustrationIcon className="h-6 w-6" strokeWidth={1.75} />
          </motion.div>
        </motion.div>
      )}
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
