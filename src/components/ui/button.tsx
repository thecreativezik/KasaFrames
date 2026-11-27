import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill buttons, after the reference: a solid bone pill for the one action that
 * matters on a screen, hairline pills for everything else. Transform is in the
 * transition list so the press scale eases instead of snapping.
 */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,opacity,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink py-2 disabled:pointer-events-none disabled:border-bone/10 disabled:bg-bone/[0.06] disabled:text-bone/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-bone text-ink hover:bg-white",
        // Kept as an alias so older call sites stay on the monochrome system.
        gold: "bg-bone text-ink hover:bg-white",
        secondary: "border border-bone/20 bg-transparent text-bone hover:border-bone/45 hover:bg-bone/[0.04]",
        outline: "border border-bone/20 bg-transparent text-bone hover:border-bone/45 hover:bg-bone/[0.04]",
        ghost: "text-bone/70 hover:bg-bone/[0.06] hover:text-bone",
        link: "rounded-none px-0 text-bone underline decoration-bone/30 underline-offset-[6px] hover:decoration-bone active:scale-100",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
