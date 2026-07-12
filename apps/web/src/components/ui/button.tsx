import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-label text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-md hover:opacity-90 hover:shadow-lg",
        secondary:
          "border border-[var(--surface-border)] bg-[rgba(255,255,255,0.04)] text-foreground hover:border-[var(--surface-border-hover)] hover:bg-[rgba(255,255,255,0.07)]",
        inverted: "bg-accent text-accent-foreground hover:bg-accent/80",
        outline:
          "border border-[var(--surface-border)] bg-transparent text-foreground hover:border-[var(--surface-border-hover)] hover:bg-[rgba(255,255,255,0.04)]",
        brand:
          "border border-brand/30 bg-brand text-brand-foreground shadow-[0_0_20px_-4px_rgba(74,222,128,0.4)] hover:border-brand/50 hover:bg-brand/90 hover:shadow-[0_0_28px_-4px_rgba(74,222,128,0.55)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "text-muted-foreground hover:bg-[rgba(255,255,255,0.05)] hover:text-foreground",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
