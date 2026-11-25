import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { collections, getCollection, getProductsByCollection } from "@/lib/data/catalog";
import { formatGhs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Collection" };
  return { title: c.title, description: c.subtitle };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();

  const items = getProductsByCollection(c.slug);

  return (
    <div className="pb-24 lg:pb-36">
      <section className="shell pt-16 lg:pt-24">
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center text-[13px] text-bone/60 transition-colors hover:text-bone"
        >
          ← All collections
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end">
          <header className="lg:col-span-7">
            <h1 className="text-display-lg text-balance">{c.title}</h1>
          </header>
          <p className="text-lead font-light text-bone/60 text-pretty lg:col-span-5 lg:pb-2">{c.positioning}</p>
        </div>
        <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-panel bg-ink-raised sm:aspect-[21/9] lg:mt-16">
          <Image src={c.heroImage} alt={c.title} fill priority className="object-cover" sizes="100vw" />
        </div>
      </section>

      <section className="shell mt-20 lg:mt-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:pr-6">
            <h2 className="text-title">How to style it</h2>
            <ul className="mt-6 border-t border-bone/10">
              {c.stylingTips.map((t) => (
                <li key={t} className="border-b border-bone/10 py-5 text-[15px] leading-relaxed text-bone/70 text-pretty">
                  {t}
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-title">Suggested layouts</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {c.layoutIdeas.map((l) => (
                <li key={l} className="rounded-full border border-bone/15 px-4 py-2 text-[13px] text-bone/70">
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-title">Pieces in this collection</h2>
            <div className="mt-6 grid gap-x-5 gap-y-12 sm:grid-cols-2">
              {items.map((p, idx) => {
                const from = p.sizes.length ? Math.min(...p.sizes.map((s) => s.frameGhs)) : null;
                return (
                  <Reveal key={p.id} delay={idx * 0.05}>
                    <Link href={`/product/${p.slug}`} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-tile bg-ink-raised">
                        <Image
                          src={p.heroImage}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                        />
                      </div>
                      <div className="mt-5 flex items-start justify-between gap-4">
                        <h2 className="text-title text-balance decoration-bone/30 underline-offset-[6px] group-hover:underline">{p.name}</h2>
                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-bone/50 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" />
                      </div>
                      {from !== null ? (
                        <p className="mt-2 text-[13px] tabular-nums text-bone">From {formatGhs(from)}</p>
                      ) : null}
                      <p className="mt-3 text-[15px] leading-relaxed text-bone/50 text-pretty">{p.tagline}</p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
