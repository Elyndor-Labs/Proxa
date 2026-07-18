import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-control)] border font-label text-xs font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary px-3 py-1 text-primary-foreground",
        secondary: "border-transparent bg-secondary px-3 py-1 text-secondary-foreground",
        brand: "border-transparent bg-brand/15 px-3 py-1 text-brand",
        outline: "border-[var(--surface-border)] bg-transparent px-3 py-1 text-text-secondary",
        muted: "border-[var(--surface-border)] bg-muted/60 px-3 py-1 text-text-secondary",
        success: "border-transparent bg-brand/15 px-3 py-1 text-brand",
        warning: "border-transparent bg-warning/15 px-3 py-1 text-warning",
        destructive: "border-transparent bg-destructive/15 px-3 py-1 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
