import type { Metadata } from "next";
import { WallVisualizer } from "@/components/visualizer/wall-visualizer";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Wall visualizer",
  description:
    "Photograph your wall and try KasaFrames pieces on it at true size, in the room's own perspective, with the cost as you go.",
};

/** The three moves, in order. */
const steps = [
  { title: "Choose a wall", body: "Start with one of our rooms, or a photo of your own." },
  { title: "Hang pieces at true size", body: "Pick a finish and size, then drag them where you want them." },
  { title: "Send it to the studio", body: "Preview the finished wall with its cost, and we take it from there." },
];

/** Why the sizes can be trusted. Each one is how the tool actually works. */
const truths = [
  {
    title: "Measured, not guessed",
    body: "Each sample room was measured against furniture of known size. On your own photo, measure one thing, a door or a sofa, and every frame is drawn to that scale.",
  },
  {
    title: "In your room's perspective",
    body: "We read the ceiling and skirting lines to find the plane of the wall, so a frame narrows as the wall turns away, the way it will in the room.",
  },
  {
    title: "Hung at 145 cm",
    body: "New pieces land with their centre 145 cm off the floor, the height galleries hang to, and settle back onto that line as you drag.",
  },
];

export default function VisualizerPage() {
  return (
    <div className="shell pb-24 pt-10 lg:pb-36 lg:pt-16">
      <header className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h1 className="text-display-lg text-balance lg:col-span-7">
          See the composition before we install a single anchor.
        </h1>
        <ol className="border-t border-bone/10 lg:col-span-5">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-2 border-b border-bone/10 py-3.5">
              <span className="pt-0.5 text-[13px] tabular-nums text-kasa-gold">{i + 1}</span>
              <span className="text-[15px] leading-relaxed text-bone/60">
                <span className="text-bone">{s.title}.</span> {s.body}
              </span>
            </li>
          ))}
        </ol>
      </header>

      <div className="mt-12 lg:mt-16">
        <WallVisualizer />
      </div>

      <section aria-labelledby="true-size" className="mt-24 lg:mt-36">
        <h2 id="true-size" className="max-w-3xl text-display-md text-balance">
          What you see is the size it will be.
        </h2>
        <ul className="mt-12 grid border-t border-bone/10 md:grid-cols-3">
          {truths.map((t, i) => (
            <li
              key={t.title}
              className="border-b border-bone/10 py-8 md:border-b-0 md:border-r md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <Reveal delay={i * 0.06}>
                <h3 className="text-title">{t.title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-bone/60 text-pretty">{t.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
