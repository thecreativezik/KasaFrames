"use client";

import * as React from "react";
import { studioStatus, type StudioStatus as Status } from "@/lib/studio";
import { cn } from "@/lib/utils";

/**
 * "Open now, until 18:00", worked out in the visitor's browser and refreshed
 * every minute. Renders nothing on the server so the clock never mismatches.
 */
export function StudioStatus({ className, showTime = false }: { className?: string; showTime?: boolean }) {
  const [status, setStatus] = React.useState<Status | null>(null);

  React.useEffect(() => {
    const tick = () => setStatus(studioStatus());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!status) return <span className={cn("invisible", className)}>Studio hours</span>;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", status.open ? "bg-emerald-400" : "bg-bone/30")}
      />
      <span>
        {showTime ? <span className="tabular-nums">Accra {status.time} · </span> : null}
        {status.label}
      </span>
    </span>
  );
}
