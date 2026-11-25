"use client";

import { cn } from "@/lib/utils";

/**
 * On is a solid bone track with a dark knob at the right; off is a hairline
 * track with a dimmed knob at the left. The button itself is 44px tall so it
 * is easy to hit on a phone. Name it with `aria-labelledby` or `aria-label`.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  ...aria
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  className?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn("group relative inline-flex h-11 w-14 shrink-0 items-center justify-center", className)}
      {...aria}
    >
      <span
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors duration-200",
          checked ? "border-bone bg-bone" : "border-bone/30 bg-transparent group-hover:border-bone/50",
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[transform,background-color] duration-200 ease-out",
            checked ? "translate-x-5 bg-ink" : "translate-x-0 bg-bone/60",
          )}
        />
      </span>
    </button>
  );
}
