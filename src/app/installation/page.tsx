import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { INSTALLATION_GHS } from "@/lib/data/catalog";
import { formatGhs } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Installation experience",
  description: "Careful installation, precise alignment, and calm project management across Accra.",
};

const steps = [
  {
    title: "Survey and mark",
    body: "We check the wall, plan the load and read the sightlines before any fixing touches the surface.",
  },
  {
    title: "Precision hang",
    body: "Small adjustments until the composition reads as one gesture, not a set of separate objects.",
  },
  {
    title: "Reveal and care",
    body: "A final clean, hidden hardware, and a word on keeping the finish looking right.",
  },
];

const shots = [
  {
    src: "/media/gallery-wall/corridor-portrait-grid.jpg",
    title: "Corridor grid",
    detail: "A4 and A3, black moulding",
  },
  {
    src: "/media/staircase/stair-cascade-quotes.jpg",
    title: "Stair cascade",
    detail: "Set out from the nosing, not the floor",
  },
];

export default function InstallationPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pb-36 lg:pt-24">
      <PageIntro title="The install is where a wall becomes finished.">
        Careful setting out, levelling and quiet coordination, so your home or venue stays composed while we work.
      </PageIntro>

      <section aria-label="How an install runs" className="mt-16 lg:mt-24">
        <ol className="grid border-t border-bone/10 lg:grid-cols-3">
          {steps.map((s, idx) => (
            <li
              key={s.title}
              className="border-b border-bone/10 py-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-10 lg:first:pl-0 lg:last:border-r-0"
            >
              <Reveal delay={idx * 0.06}>
                <span className="text-[13px] tabular-nums text-bone/50">0{idx + 1}</span>
                <h2 className="mt-4 text-title">{s.title}</h2>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-bone/60 text-pretty">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Installed walls" className="mt-20 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-28">
        {shots.map((shot) => (
          <Reveal key={shot.src}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-tile bg-ink-raised">
                <Image
                  src={shot.src}
                  alt={`${shot.title}: ${shot.detail}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-[15px] text-bone">{shot.title}</span>
                <span className="text-[13px] text-bone/50">{shot.detail}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </section>

      <section className="mt-20 lg:mt-28">
        <Reveal>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-ink-raised sm:aspect-[21/9]">
              <Image
                src="/media/gallery-wall/corridor-salon-wall.jpg"
                alt="A salon wall hung along a corridor"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <figcaption className="mt-4 text-[13px] text-bone/50">Corridor salon wall, mixed sizes on one sightline</figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="mt-20 grid gap-10 border-t border-bone/10 pt-14 lg:mt-28 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-display-sm text-balance">
            Installation is a flat {formatGhs(INSTALLATION_GHS)} per frame, whichever type you choose.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
          <Button asChild size="lg">
            <Link href="/book">Book a consultation</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/policies#installation">How we work</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
