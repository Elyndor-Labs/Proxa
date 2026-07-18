import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-label font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-sm hover:opacity-90",
        secondary:
          "border border-(--surface-border) bg-transparent text-foreground hover:border-brand/30 hover:bg-white/[0.03]",
        inverted: "bg-accent text-accent-foreground hover:bg-accent/80",
        outline:
          "border border-(--surface-border) bg-transparent text-text-secondary hover:border-brand/35 hover:bg-white/[0.03] hover:text-foreground",
        brand:
          "border border-brand/25 bg-[#36b86a] text-brand-foreground shadow-none hover:bg-brand hover:border-brand/35 hover:shadow-none",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        ghost:
          "font-semibold text-text-secondary hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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
