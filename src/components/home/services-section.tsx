import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/layout/page-intro";

/** Drawn from how the studio actually works (see lib/data/site.ts). */
const services = [
  {
    title: "Consultation",
    body: "We visit, measure the wall and read the light before recommending anything. A video call covers most of the same ground.",
    href: "/book",
  },
  {
    title: "Curation",
    body: "Frame type, finish and scale, chosen against the architecture, the artwork and your budget.",
    href: "/collections",
  },
  {
    title: "Made to order",
    body: "Made by the workshops we work with, typically within 3 to 7 days, then inspected by us before it reaches you.",
    href: "/policies",
  },
  {
    title: "Gallery walls",
    body: "Several pieces composed as one wall: grids, salon clusters, corridors and stair cascades, spacing planned first.",
    href: "/gallery",
  },
  {
    title: "Wall visualizer",
    body: "Photograph your wall and try pieces on it at true size, priced from the same list we quote from.",
    href: "/visualizer",
  },
  {
    title: "Installation",
    body: "We set out, level and hang every piece, then walk the finished wall with you before we leave.",
    href: "/installation",
  },
];

export function ServicesSection() {
  return (
    <section className="shell py-24 lg:py-36">
      <SectionHeading title="From an empty wall to a finished composition." />

      <ol className="mt-14 border-t border-bone/10 lg:mt-20">
        {services.map((s, i) => (
          <li key={s.title} className="border-b border-bone/10">
            <Link
              href={s.href}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 gap-y-3 py-7 transition-colors hover:bg-bone/[0.025] sm:py-8 lg:grid-cols-12 lg:items-center lg:gap-x-8"
            >
              <span className="pt-1.5 text-[11px] tabular-nums text-bone/50 lg:col-span-1 lg:pt-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title text-bone transition-transform duration-300 ease-out group-hover:translate-x-1 lg:col-span-4">
                {s.title}
              </h3>
              <ArrowUpRight className="mt-1.5 h-5 w-5 lg:mt-0 text-bone/40 transition-[color,transform] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone lg:order-last lg:col-span-1 lg:justify-self-end" />
              <p className="col-span-2 col-start-2 max-w-xl text-[16px] font-light leading-relaxed text-bone/60 sm:text-[17px] lg:col-span-6 lg:col-start-auto">
                {s.body}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
