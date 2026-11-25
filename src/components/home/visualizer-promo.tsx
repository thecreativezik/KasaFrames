import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

/**
 * Took the place of a "Before / After" block that paired two unrelated finished
 * photographs as though they were the same wall. This sells the thing we can
 * actually prove: try it on your own wall before you spend anything.
 */
const points = [
  "Photograph your wall and mark its corners. Pieces hang in the room's own perspective.",
  "Everything is drawn at true size against the measurements you give us.",
  "The cost updates as you go, from the same price list we quote from.",
];

export function VisualizerPromo() {
  return (
    <section className="border-y border-bone/[0.08] bg-ink-raised">
      <div className="shell grid gap-14 py-24 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-36">
        <Reveal className="lg:col-span-5">
          <h2 className="text-display-md text-balance">See it on your wall first.</h2>
          <p className="mt-6 text-lead font-light text-bone/60 text-pretty">
            Guessing whether a 16 × 20 will look small over the sofa is how people end up with the wrong frame. Put
            your own photograph in, and find out before anything is made.
          </p>

          <ol className="mt-10 border-t border-bone/10">
            {points.map((text, i) => (
              <li key={text} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-bone/10 py-4">
                <span className="pt-1 text-[11px] tabular-nums text-bone/50">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15px] leading-relaxed text-bone/60">{text}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/visualizer">Open the visualizer</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/collections">Browse frame types</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7 lg:pl-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-ink">
            <Image
              src="/media/rooms/loft-sofa.jpg"
              alt="A living room wall ready for framing"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {/* Indicative frames, drawn to show what the tool does. */}
            <div className="absolute inset-0" aria-hidden>
              {[38, 50, 62].map((left) => (
                <span
                  key={left}
                  className="absolute block rounded-[2px] border-[3px] border-ink bg-bone/70 shadow-lg"
                  style={{ left: `${left}%`, top: "30%", width: "9%", height: "22%", transform: "translateX(-50%)" }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
