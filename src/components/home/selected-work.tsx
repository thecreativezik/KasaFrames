import Link from "next/link";
import { SectionHeading } from "@/components/layout/page-intro";
import { GalleryImage } from "@/components/gallery/gallery-image";
import { Button } from "@/components/ui/button";
import { finishFamilies, type GalleryItem } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";

/**
 * The reference's run of oversized project names, one row per finish. On a
 * pointer device the other rows dim while one is hovered.
 */
export function SelectedWork({ items }: { items: GalleryItem[] }) {
  const groups = finishFamilies
    .map((meta) => ({ meta, pieces: items.filter((i) => i.family === meta.key) }))
    .filter((g) => g.pieces.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="shell py-24 lg:py-36">
      <SectionHeading
        title="Work, by finish."
        action={
          <Button asChild size="lg" variant="secondary">
            <Link href="/gallery">View the full gallery</Link>
          </Button>
        }
      />

      <ul className="group/list mt-14 border-t border-bone/10 lg:mt-20">
        {groups.map(({ meta, pieces }, i) => (
          <li
            key={meta.key}
            className="border-b border-bone/10 transition-opacity duration-300 lg:group-hover/list:opacity-40 lg:hover:!opacity-100"
          >
            <Link
              href={`/gallery?finish=${meta.key}`}
              className="group grid items-center gap-x-8 gap-y-5 py-7 sm:grid-cols-[1fr_auto] lg:py-9"
            >
              <div className="flex min-w-0 items-start gap-3 sm:gap-5">
                <span className="shrink-0 pt-2 text-[11px] tabular-nums text-bone/50 lg:pt-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[clamp(2.5rem,7.6vw,7.5rem)] leading-[0.95] tracking-[-0.04em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                    {meta.label}
                  </h3>
                  <p className="mt-3 text-[15px] text-bone/60">
                    {meta.tagline} · {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pl-7 sm:pl-0">
                {pieces.slice(0, 3).map((p, j) => (
                  <div
                    key={p.id}
                    className={cn(
                      "relative h-24 w-[60px] overflow-hidden rounded-tile bg-ink-raised sm:h-28 sm:w-[72px] lg:h-36 lg:w-[92px]",
                      j > 0 && "hidden sm:block",
                    )}
                  >
                    <GalleryImage
                      item={p}
                      className="object-cover"
                      sizes="92px"
                    />
                  </div>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
