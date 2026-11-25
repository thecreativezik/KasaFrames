import Link from "next/link";
import Image from "next/image";
import { collections, getProductsByCollection } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { formatGhs } from "@/lib/utils";

/** Lowest published frame price in a collection, or null if it has no sizes. */
function fromPrice(slug: (typeof collections)[number]["slug"]) {
  const prices = getProductsByCollection(slug).flatMap((p) => p.sizes.map((s) => s.frameGhs));
  return prices.length ? Math.min(...prices) : null;
}

export function CollectionsPreview() {
  return (
    <section className="shell py-24 lg:py-36">
      <SectionHeading
        title="Four frame types, priced in the open."
        action={
          <Button asChild size="lg" variant="secondary">
            <Link href="/collections">All collections</Link>
          </Button>
        }
      />

      <div className="mt-14 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
        {collections.map((c, idx) => {
          const from = fromPrice(c.slug);
          return (
            <Reveal key={c.slug} delay={idx * 0.06}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-tile bg-ink-raised">
                  <Image
                    src={c.heroImage}
                    alt={c.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="mt-5 text-title text-balance decoration-bone/30 underline-offset-[6px] group-hover:underline">{c.title}</h3>
                {from !== null ? (
                  <p className="mt-2 text-[13px] tabular-nums text-bone">From {formatGhs(from)}</p>
                ) : null}
                <p className="mt-3 text-[15px] leading-relaxed text-bone/50 text-pretty">{c.subtitle}</p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
