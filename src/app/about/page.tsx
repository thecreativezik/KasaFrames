import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { collections, INSTALLATION_GHS } from "@/lib/data/catalog";
import { processSteps } from "@/lib/data/site";
import { EYE_LEVEL_CM } from "@/lib/visualizer";
import { formatGhs } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "KasaFrames is a Ghana-based luxury wall aesthetics studio transforming interiors across Accra.",
};

const principles = [
  {
    title: "Mission",
    body: "Transform empty walls into modern statement spaces, without visual noise.",
  },
  {
    title: "Philosophy",
    body: "Composition first. Product second. Installation as the final brushstroke.",
  },
  {
    title: "Craft",
    body: "Tolerances, edge control and hardware you never see, but always feel.",
  },
];

/** Every figure here comes from the price list or how the studio works. */
const facts = [
  { figure: String(collections.length), caption: "frame types, every size and price published" },
  { figure: `${EYE_LEVEL_CM} cm`, caption: "the height we hang the centre of a picture to" },
  { figure: "3–7 days", caption: "to make your frames once the deposit clears" },
  { figure: formatGhs(INSTALLATION_GHS), caption: "to install a frame, whichever type you choose" },
];

/** A small round picture set into a line of type. */
function InlinePicture({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="relative mx-[0.12em] inline-block h-[0.78em] w-[1.55em] overflow-hidden rounded-full align-[-0.06em]"
    >
      <Image src={src} alt="" fill priority sizes="160px" className="object-cover" />
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="pb-24 lg:pb-36">
      <section className="shell pt-10 lg:pt-16">
        <h1 className="max-w-[18ch] text-display-xl text-balance">
          Modern Ghanaian <InlinePicture src="/media/gallery-wall/heritage-family-wall.jpg" /> aesthetics, composed
          with editorial <InlinePicture src="/media/framed-matte/framed-trio-mono.jpg" /> discipline.
        </h1>
      </section>

      <Reveal className="shell mt-16 lg:mt-24">
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-ink-raised sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src="/media/gallery-wall/editorial-gallery-wall.jpg"
              alt="An editorial gallery wall composed by KasaFrames"
              fill
              priority
              className="object-cover object-[50%_40%]"
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          </div>
          <figcaption className="mt-4 text-[13px] text-bone/50">Editorial wall, frames and objects set into recessed bays</figcaption>
        </figure>
      </Reveal>

      <section className="shell mt-20 grid gap-10 lg:mt-32 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-6">
          <p className="text-display-sm text-balance">
            KasaFrames exists because walls are architecture too often treated as an afterthought.
          </p>
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-5 lg:col-start-8">
          <p className="text-[17px] font-light leading-relaxed text-bone/60 text-pretty">
            We work like an interior studio, measuring light, rhythm and daily movement, then specifying framing that
            feels native to the room. Our practice blends African warmth with minimalist precision: matte blacks, soft
            creams, gold used sparingly, and installations executed with the calm of a private gallery.
          </p>
        </Reveal>
      </section>

      <section aria-label="The studio in figures" className="shell mt-20 lg:mt-32">
        <ul className="grid grid-cols-2 border-t border-bone/10 lg:grid-cols-4">
          {facts.map((f, i) => (
            <li
              key={f.caption}
              className="border-b border-bone/10 py-8 pr-4 odd:border-r odd:pr-6 even:pl-6 sm:py-10 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:even:pl-8"
            >
              <Reveal delay={i * 0.05}>
                <p className="text-display-md tabular-nums">{f.figure}</p>
                <p className="mt-3 max-w-[22ch] text-[14px] leading-relaxed text-bone/50">{f.caption}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="what-we-stand-for" className="shell mt-24 lg:mt-36">
        <h2 id="what-we-stand-for" className="text-display-md text-balance">
          What we stand for.
        </h2>
        <ul className="mt-12 border-t border-bone/10">
          {principles.map((p, i) => (
            <li key={p.title} className="border-b border-bone/10">
              <Reveal delay={i * 0.04} className="grid gap-3 py-8 lg:grid-cols-12 lg:items-baseline lg:gap-10 lg:py-12">
                <h3 className="text-display-sm lg:col-span-4">{p.title}</h3>
                <p className="max-w-2xl text-lead font-light text-bone/60 text-pretty lg:col-span-8">{p.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-a-wall" className="shell mt-24 grid gap-14 lg:mt-36 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="how-a-wall" className="text-display-md text-balance">
            How a wall comes together.
          </h2>
          <Reveal className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-panel bg-ink-raised lg:block">
            <Image
              src="/media/staircase/stair-cascade-quotes.jpg"
              alt="A cascade of framed quotes set out up a staircase"
              fill
              className="object-cover"
              sizes="40vw"
            />
          </Reveal>
        </div>
        <ol className="border-t border-bone/10 lg:col-span-6 lg:col-start-7 lg:self-end">
          {processSteps.map((step, i) => (
            <li key={step.title} className="border-b border-bone/10">
              <Reveal delay={i * 0.05} className="grid grid-cols-[3rem_1fr] gap-2 py-8 lg:py-10">
                <span className="pt-1.5 text-[13px] tabular-nums text-kasa-gold">0{i + 1}</span>
                <div>
                  <h3 className="text-title">{step.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-bone/60 text-pretty">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="shell mt-24 lg:mt-36">
        <div className="relative overflow-hidden rounded-panel border border-bone/10 bg-ink-raised">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col justify-between gap-10 p-8 sm:p-12 lg:p-16">
              <h2 className="max-w-md text-display-md text-balance">Start with the wall you have.</h2>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/book">
                    Book a consultation
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/gallery">See the work</Link>
                </Button>
              </div>
            </div>
            <div className="relative min-h-[18rem] lg:min-h-[26rem]">
              <Image
                src="/media/framed-matte/dining-salon-arrangement.jpg"
                alt="A framed salon arrangement above a dining table"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
