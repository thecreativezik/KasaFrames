"use client";

import { useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { GalleryImage } from "@/components/gallery/gallery-image";
import { familyLabel, type GalleryItem } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";

/**
 * The reference's strip of tall portrait cards, drifting sideways. Two copies
 * of the set make the loop seamless; each card carries its own right padding
 * (not a flex gap) so -50% lands exactly on the start of the second copy.
 * It pauses on hover and focus, has its own pause button, and stands still
 * as a scrollable row when the visitor asks for reduced motion.
 */
export function WorkMarquee({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const set = items.slice(0, 12);
  const copies = reduce ? [0] : [0, 1];

  if (set.length === 0) return null;

  return (
    <section aria-labelledby="recent-work" className="mt-16 lg:mt-24">
      <div className="shell flex items-center justify-between gap-4">
        <h2 id="recent-work" className="text-[15px] tracking-[-0.01em] text-bone">
          Recent work
        </h2>
        <div className="-mr-3 flex items-center">
          {!reduce ? (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] text-bone/60 transition-colors hover:text-bone"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? "Play" : "Pause"}
            </button>
          ) : null}
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[13px] text-bone/60 transition-colors hover:text-bone"
          >
            Gallery <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "mt-6",
          reduce
            ? "no-scrollbar overflow-x-auto px-5 sm:px-8 lg:px-14"
            : "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]",
        )}
      >
        <div
          className={cn(
            "flex w-max",
            !reduce && "animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
            paused && "[animation-play-state:paused]",
          )}
        >
          {copies.map((copy) =>
            set.map((item, i) => (
              <Link
                key={`${copy}-${item.id}`}
                href={`/gallery?finish=${item.family}`}
                aria-hidden={copy === 1 ? true : undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                className="group block w-[196px] shrink-0 pr-4 sm:w-[236px] lg:w-[286px]"
              >
                <div className="relative aspect-[27/43] overflow-hidden rounded-tile bg-ink-raised">
                  <GalleryImage
                    item={item}
                    priority={copy === 0 && i < 4}
                    className="object-cover"
                    sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 270px"
                  />
                </div>
                <p className="mt-3 text-[13px] leading-snug text-bone text-pretty">{item.title}</p>
                <p className="mt-1 text-[12px] leading-snug text-bone/50">
                  {familyLabel(item.family)} · {item.room}
                </p>
              </Link>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
