import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary-deep hover:shadow-lift hover:-translate-y-0.5",
        /** Key conversion moments only — "Book a Lesson". Use sparingly. */
        cta: "bg-gradient-to-b from-accent to-accent/90 text-accent-foreground shadow-lift hover:shadow-hover hover:brightness-[1.03] hover:-translate-y-0.5",
        /** Warm ochre, for secondary marketing actions. */
        warm: "bg-secondary text-secondary-foreground shadow-soft hover:shadow-lift hover:brightness-[1.03] hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:brightness-95",
        outline:
          "border border-border bg-card text-foreground shadow-soft hover:bg-surface hover:border-primary-soft hover:shadow-lift hover:-translate-y-0.5",
        /** Quiet action on tinted backgrounds. */
        subtle: "bg-primary-soft text-primary-deep hover:bg-primary-soft/70",
        secondary: "bg-surface text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-surface",
        /** For use on dark editorial bands. */
        onInk: "border border-ink-foreground/25 text-ink-foreground hover:bg-ink-foreground/10",
        link: "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-8 text-base",
        /** Compact control for dense portal toolbars and tables. */
        portal: "h-8 rounded-sm px-3 text-[0.8125rem] font-medium",
        icon: "h-11 w-11",
        iconSm: "h-8 w-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
