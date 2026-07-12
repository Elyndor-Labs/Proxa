import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-label font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-md hover:opacity-90 hover:shadow-lg",
        secondary:
          "border border-border/70 bg-card/70 text-foreground shadow-sm hover:border-brand/35 hover:bg-card hover:shadow-[0_0_20px_-8px_rgba(74,222,128,0.35)]",
        inverted: "bg-accent text-accent-foreground hover:bg-accent/80",
        outline:
          "border border-border/80 bg-card/50 text-foreground shadow-sm hover:border-brand/40 hover:bg-card hover:text-foreground",
        brand:
          "border border-brand/40 bg-brand text-brand-foreground shadow-[0_0_24px_-4px_rgba(74,222,128,0.55)] hover:bg-[#5ef59a] hover:shadow-[0_0_32px_-4px_rgba(74,222,128,0.65)]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        ghost:
          "font-semibold text-muted-foreground hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
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
