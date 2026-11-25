import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Underlined field, as in the reference's contact form. 16px text so iOS does
 * not zoom on focus, and 48px tall so it is an easy target on a phone.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-none border-0 border-b border-bone/20 bg-transparent px-0 text-base text-bone outline-none transition-colors placeholder:text-bone/45 hover:border-bone/35 focus:border-bone focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-400/80 file:mr-4 file:rounded-full file:border-0 file:bg-bone/10 file:px-4 file:py-1.5 file:text-sm file:text-bone",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
