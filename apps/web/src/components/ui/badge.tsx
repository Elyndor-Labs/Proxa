import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-lg border font-label text-xs font-bold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary px-3 py-1 text-primary-foreground",
        secondary: "border-transparent bg-secondary px-3 py-1 text-secondary-foreground",
        brand:
          "border-transparent bg-brand px-3.5 py-1 text-brand-foreground shadow-[0_0_16px_-4px_rgba(74,222,128,0.45)]",
        outline:
          "border-border/70 bg-card/50 px-3 py-1 text-foreground hover:border-border hover:bg-card",
        muted: "border-border/50 bg-muted/80 px-3 py-1 text-muted-foreground",
        success:
          "border-transparent bg-brand px-3.5 py-1 text-brand-foreground shadow-[0_0_12px_-4px_rgba(74,222,128,0.35)]",
        warning: "border-transparent bg-warning px-3.5 py-1 text-[#050805]",
        destructive: "border-transparent bg-destructive/90 px-3.5 py-1 text-white",
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
