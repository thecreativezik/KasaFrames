import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-normal tracking-[-0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-bone bg-bone text-ink",
        outline: "border-bone/20 text-bone/80",
        gold: "border-kasa-gold/40 bg-kasa-gold/10 text-bone",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
