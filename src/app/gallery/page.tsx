import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { loadGalleryItems } from "@/lib/data/media";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Portfolio gallery",
  description:
    "KasaFrames work by finish—acrylic gloss, matte framed, canvas wrap, photo blocks, gallery walls and staircase cascades.",
};

export default function GalleryPage() {
  // Read at build time from public/media/, so adding a photo needs no code change.
  const items = loadGalleryItems();

  return (
    <div className="shell pb-24 pt-16 lg:pb-32 lg:pt-24">
      <PageIntro title="Walls that read like editorial spreads.">
        Filter by finish—acrylic gloss, matte framed, canvas wrap, photo block—or by the kind of wall you are planning. Tap any piece for the sizes and spacing behind it.
      </PageIntro>

      <div className="mt-16 lg:mt-20">
        <GalleryExplorer items={items} />
      </div>
    </div>
  );
}
