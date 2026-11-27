"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { collections, getProductsByCollection, type Product } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { cn, formatGhs } from "@/lib/utils";

/** Each frame type with the one product it sells, skipping any without a price list. */
const entries = collections.flatMap((collection) => {
  const product = getProductsByCollection(collection.slug)[0];
  return product && product.sizes.length > 0 ? [{ collection, product }] : [];
});

/** Every size is drawn against the largest we sell, so all four types share one scale. */
const CHART_W = Math.max(...entries.flatMap((e) => e.product.sizes.map((s) => s.widthIn)));
const CHART_H = Math.max(...entries.flatMap((e) => e.product.sizes.map((s) => s.heightIn)));
/** An A4 sheet, in inches, for a sense of size. */
const A4 = { w: 8.27, h: 11.69 };

/** Open on 16 × 20, the size most walls start from, where a type sells it. */
function startingSize(product: Product) {
  const i = product.sizes.findIndex((s) => s.widthIn === 16 && s.heightIn === 20);
  return i >= 0 ? i : Math.floor(product.sizes.length / 2);
}

/**
 * The four frame types as tabs. Each opens on its published sizes, drawn to
 * scale against one another and an A4 sheet, with the price of every size
 * and what it costs installed.
 */
export function CollectionsPreview() {
  const [active, setActive] = React.useState(0);
  const [chosen, setChosen] = React.useState(() => entries.map((e) => startingSize(e.product)));
  const [preview, setPreview] = React.useState<number | null>(null);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  if (entries.length === 0) return null;

  const { collection, product } = entries[active];
  const shown = preview ?? chosen[active];
  const size = product.sizes[shown] ?? product.sizes[0];

  const open = (i: number) => {
    setActive(i);
    setPreview(null);
  };

  const onTabKey = (event: React.KeyboardEvent, i: number) => {
    const last = entries.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: i === last ? 0 : i + 1,
      ArrowDown: i === last ? 0 : i + 1,
      ArrowLeft: i === 0 ? last : i - 1,
      ArrowUp: i === 0 ? last : i - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    open(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="frame-types-title" className="shell py-24 lg:py-36">
      <SectionHeading
        id="frame-types-title"
        title="Four frame types, priced in the open."
        action={
          <Button asChild size="lg" variant="secondary">
            <Link href="/collections">All collections</Link>
          </Button>
        }
      />

      <div role="tablist" aria-label="Frame types" className="mt-14 grid grid-cols-2 gap-x-5 lg:mt-20 lg:grid-cols-4 lg:gap-x-8">
        {entries.map(({ collection: c, product: p }, i) => {
          const selected = i === active;
          const from = Math.min(...p.sizes.map((s) => s.frameGhs));
          return (
            <button
              key={c.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`frame-tab-${c.slug}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="frame-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => open(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              className="group relative border-t border-bone/15 pb-6 pt-5 text-left lg:pb-8 lg:pt-6"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 -top-px h-px origin-left bg-bone transition-transform duration-500 ease-out motion-reduce:transition-none",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
              <span
                className={cn(
                  "block text-[17px] leading-snug tracking-[-0.02em] transition-colors duration-300 text-balance sm:text-title",
                  selected ? "text-bone" : "text-bone/50 group-hover:text-bone/80",
                )}
              >
                {/* Keep a dash with the word before it, so a wrapped line never starts with one. */}
                {c.title.replace(" — ", "\u00a0— ")}
              </span>
              <span className="mt-2 block text-[13px] tabular-nums text-bone/50">
                From {formatGhs(from)} · {p.sizes.length} sizes
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="frame-panel"
        role="tabpanel"
        aria-labelledby={`frame-tab-${collection.slug}`}
        tabIndex={0}
        className="mt-10 grid gap-10 rounded-tile lg:mt-14 lg:grid-cols-12"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-tile bg-ink-raised sm:aspect-[16/10] lg:col-span-5 lg:aspect-auto lg:min-h-[30rem]">
          <Image
            key={collection.slug}
            src={collection.heroImage}
            alt={collection.title}
            fill
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="story-swap object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col lg:col-span-7">
          <p key={collection.slug} className="story-swap max-w-2xl text-lead font-light text-bone/60 text-pretty">
            <span className="text-bone">{collection.subtitle}</span> {collection.positioning}
          </p>

          <div className="mt-10 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-10 lg:mt-12">
            <figure>
              <svg
                viewBox={`-0.5 -0.5 ${CHART_W + 1} ${CHART_H + 1}`}
                className="block w-full"
                role="img"
                aria-label={`${size.label} inches, drawn to scale against the other sizes and an A4 sheet`}
              >
                {product.sizes.map((s, i) => (
                  <rect
                    key={s.label}
                    x={(CHART_W - s.widthIn) / 2}
                    y={(CHART_H - s.heightIn) / 2}
                    width={s.widthIn}
                    height={s.heightIn}
                    strokeWidth={0.18}
                    className={cn(
                      "transition-[fill,stroke] duration-300 motion-reduce:transition-none",
                      i === shown ? "fill-bone/[0.07] stroke-bone" : "fill-transparent stroke-bone/20",
                    )}
                  />
                ))}
                <rect
                  x={(CHART_W - A4.w) / 2}
                  y={(CHART_H - A4.h) / 2}
                  width={A4.w}
                  height={A4.h}
                  fill="none"
                  strokeWidth={0.18}
                  strokeDasharray="0.7 0.5"
                  className="stroke-kasa-gold"
                />
              </svg>
              <figcaption className="mt-3 flex items-center gap-2 text-[12px] leading-snug text-bone/50">
                <span aria-hidden className="w-4 shrink-0 border-t border-dashed border-kasa-gold" />
                An A4 sheet, for scale
              </figcaption>
            </figure>

            <div className="min-w-0">
              <ul className="border-t border-bone/10" onMouseLeave={() => setPreview(null)}>
                {product.sizes.map((s, i) => {
                  const picked = i === chosen[active];
                  return (
                    <li key={s.label} className="border-b border-bone/10">
                      <button
                        type="button"
                        aria-pressed={picked}
                        onClick={() => setChosen((all) => all.map((v, j) => (j === active ? i : v)))}
                        onMouseEnter={() => setPreview(i)}
                        onFocus={() => setPreview(i)}
                        onBlur={() => setPreview(null)}
                        className={cn(
                          "flex min-h-11 w-full items-center justify-between gap-4 text-left text-[15px] tabular-nums transition-colors",
                          i === shown ? "text-bone" : "text-bone/60 hover:text-bone",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                              picked ? "bg-kasa-gold" : "bg-bone/15",
                            )}
                          />
                          <span>
                            {s.label} <span className="text-bone/50">in</span>
                          </span>
                        </span>
                        <span>{formatGhs(s.frameGhs)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed text-bone/50 tabular-nums text-pretty">
                {size.label} in: {formatGhs(size.frameGhs)} for the frame and {formatGhs(product.installationGhs)} to
                install, so <span className="text-bone">{formatGhs(size.frameGhs + product.installationGhs)}</span> on
                your wall.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 lg:mt-auto lg:pt-12">
            <Button asChild size="lg">
              <Link href={`/product/${product.slug}`}>
                Order this frame
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/collections/${collection.slug}`}>Styling ideas</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
