import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-[19px] font-medium tracking-[-0.04em] text-bone", className)}>
      Kasa<span className="text-kasa-gold">Frames</span>
    </span>
  );
}
