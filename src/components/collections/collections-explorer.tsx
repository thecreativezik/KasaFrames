"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { collections, getProductsByCollection } from "@/lib/data/catalog";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/reveal";
import { formatGhs } from "@/lib/utils";

function fromPrice(slug: (typeof collections)[number]["slug"]) {
  const prices = getProductsByCollection(slug).flatMap((p) => p.sizes.map((s) => s.frameGhs));
  return prices.length ? Math.min(...prices) : null;
}

export function CollectionsExplorer() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.subtitle.toLowerCase().includes(query) ||
        c.positioning.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-t border-bone/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/50" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name or mood…"
            aria-label="Filter collections"
            className="pl-7"
          />
        </div>
        <p aria-live="polite" className="text-[13px] tabular-nums text-bone/50">
          {filtered.length} of {collections.length} collections
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-panel border border-dashed border-bone/15 px-6 py-16 text-center">
          <p className="text-title">No collection matches that.</p>
          <button
            type="button"
            onClick={() => setQ("")}
            className="mt-6 inline-flex min-h-11 items-center text-[15px] text-bone underline underline-offset-4 hover:text-white"
          >
            Show all four
          </button>
        </div>
      ) : (
        <ul className="mt-12 grid gap-x-5 gap-y-16 lg:grid-cols-2">
          {filtered.map((c, idx) => {
            const from = fromPrice(c.slug);
            return (
              <li key={c.slug}>
                <Reveal delay={(idx % 2) * 0.06}>
                  <Link href={`/collections/${c.slug}`} className="group block">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-tile bg-ink-raised">
                      <Image
                        src={c.heroImage}
                        alt={c.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-3">
                      <h2 className="text-display-sm text-balance decoration-bone/30 underline-offset-[8px] group-hover:underline">{c.title}</h2>
                      <ArrowUpRight className="mt-2 h-6 w-6 text-bone/50 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
                      <p className="col-span-2 max-w-xl text-[15px] leading-relaxed text-bone/60 text-pretty">
                        {c.subtitle}
                      </p>
                      {from !== null ? (
                        <p className="col-span-2 text-[13px] tabular-nums text-bone">From {formatGhs(from)} per frame</p>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
