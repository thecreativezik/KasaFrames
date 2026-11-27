"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/reveal";
import { GalleryImage } from "@/components/gallery/gallery-image";
import {
  familyLabel,
  familyMeta,
  finishFamilies,
  type FinishFamily,
  type GalleryItem,
} from "@/lib/data/gallery";
import { cn, whatsappLink } from "@/lib/utils";
import { MessageCircle, Search, X } from "lucide-react";

type Filter = FinishFamily | "all";

export function GalleryExplorer({ items }: { items: GalleryItem[] }) {
  // Only offer a filter for a finish that actually has photography behind it.
  const families = useMemo(() => {
    const present = new Set(items.map((i) => i.family));
    return finishFamilies.filter((f) => present.has(f.key));
  }, [items]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<GalleryItem | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return items.filter((item) => {
      if (filter !== "all" && item.family !== filter) return false;
      if (!needle) return true;

      return [item.title, item.room, item.sizes, item.blurb, familyLabel(item.family)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, items, q]);

  // Home links here as /gallery?finish=<family>. Read it once on mount, and keep
  // the address in step with the chips so a filtered view can be shared.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("finish");
    if (wanted && families.some((f) => f.key === wanted)) setFilter(wanted as FinishFamily);
  }, [families]);

  function chooseFilter(next: Filter) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("finish");
    else url.searchParams.set("finish", next);
    window.history.replaceState(null, "", url);
  }

  const activeMeta = filter === "all" ? null : familyMeta(filter);

  return (
    <div>
      <div className="grid gap-8 border-t border-bone/10 pt-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="relative lg:col-span-3">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/50" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a finish, a room, a size…"
            className="pl-7"
            aria-label="Search the gallery"
          />
        </div>

        <div className="flex flex-wrap gap-2 lg:col-span-9 lg:justify-end" role="group" aria-label="Filter by finish">
          <FilterChip active={filter === "all"} onClick={() => chooseFilter("all")} count={items.length}>
            All work
          </FilterChip>

          {families.map((f) => {
            const count = items.filter((i) => i.family === f.key).length;
            return (
              <FilterChip key={f.key} active={filter === f.key} onClick={() => chooseFilter(f.key)} count={count}>
                {f.label}
              </FilterChip>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/60 text-pretty">
        {activeMeta ? (
          <>
            <span className="text-bone">{activeMeta.tagline}.</span> {activeMeta.description}
          </>
        ) : (
          <span className="text-bone/50">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            {q.trim() ? ` matching “${q.trim()}”` : ""}
          </span>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-panel border border-dashed border-bone/15 px-6 py-16 text-center">
          <p className="text-title">Nothing matches that yet.</p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-bone/60">
            Try a finish, like canvas, matte or photo block, or clear the search and browse everything.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="mt-8"
            onClick={() => {
              setQ("");
              chooseFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} delay={(idx % 6) * 0.04} className="mb-12 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="group block w-full rounded-tile text-left"
                aria-haspopup="dialog"
              >
                <div className="relative w-full overflow-hidden rounded-tile bg-ink-raised" style={{ aspectRatio: item.ratio }}>
                  <GalleryImage
                    item={item}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <p className="min-w-0 text-[15px] leading-snug text-bone decoration-bone/30 underline-offset-4 group-hover:underline">{item.title}</p>
                  <p className="shrink-0 text-[12px] text-bone/50">{familyLabel(item.family)}</p>
                </div>
                <p className="mt-1 text-[13px] text-bone/50">
                  {item.room} · {item.sizes}
                </p>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent showClose={false} className="max-w-5xl overflow-hidden p-0">
          {open ? (
            <div className="grid max-h-[88dvh] gap-0 overflow-y-auto [scrollbar-width:thin] md:grid-cols-5">
              <div className="relative bg-ink md:col-span-3">
                <div className="relative w-full" style={{ aspectRatio: open.ratio }}>
                  <GalleryImage item={open} className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
                </div>
              </div>

              <div className="flex flex-col p-6 sm:p-8 md:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[13px] text-bone/50">{familyLabel(open.family)}</p>
                  <button
                    type="button"
                    onClick={() => setOpen(null)}
                    aria-label="Close"
                    className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-bone/60 transition-[background-color,color,transform] hover:bg-bone/10 hover:text-bone active:scale-[0.95]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <DialogTitle className="mt-4 text-title text-balance">{open.title}</DialogTitle>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/60 text-pretty">{open.blurb}</p>

                <dl className="mt-8 grid border-t border-bone/10 text-[14px]">
                  {[
                    ["Space", open.room],
                    ["Sizes", open.sizes],
                    ["Finish", familyMeta(open.family)?.tagline],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-bone/10 py-3">
                      <dt className="text-bone/50">{k}</dt>
                      <dd className="min-w-0 text-right text-bone">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 grid gap-2">
                  <Button asChild size="lg">
                    <Link href="/visualizer">See it on your wall</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <a
                      href={whatsappLink(
                        `Hello KasaFrames — I'd like something like "${open.title}" (${familyLabel(open.family)}).`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle />
                      Ask about this look
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/book">Book a consultation</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97]",
        active
          ? "border-bone bg-bone text-ink"
          : "border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone",
      )}
    >
      {children}
      <span className={cn("text-[12px] tabular-nums", active ? "text-ink/60" : "text-bone/50")}>{count}</span>
    </button>
  );
}
