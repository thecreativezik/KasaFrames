import type { GalleryItem } from "@/lib/data/gallery";

/**
 * The opening wall of the home page: real projects hung along one centre line,
 * the way the studio hangs a customer's wall.
 *
 * Heights are relative (the tallest piece is the centrepiece); widths follow
 * each photograph's own proportions. `fit` scales the set so the whole wall,
 * gaps included, spans `span` units, which the page maps to viewport width.
 */
export interface HangPiece {
  item: GalleryItem;
  /** Height in wall units. 1 unit is 1vw on a desktop. */
  h: number;
}

/** Preferred order and relative heights, by file name. */
const PLAN: { file: string; h: number }[] = [
  { file: "heritage-family-wall.jpg", h: 19 },
  { file: "corridor-salon-wall.jpg", h: 12.5 },
  { file: "adinkra-symbol-panel.svg", h: 21 },
  { file: "stair-cascade-quotes.jpg", h: 15 },
  { file: "canvas-wrap-quartet.jpg", h: 14 },
  { file: "editorial-gallery-wall.jpg", h: 19 },
];

/** Space between pieces, in the same units as the heights. */
export const HANG_GAP = 1.8;

export function planHang(items: GalleryItem[], span = 88): HangPiece[] {
  const byFile = new Map(items.map((item) => [item.image.split("/").pop() ?? "", item]));
  let chosen: { item: GalleryItem; h: number }[] = PLAN.flatMap(({ file, h }) => {
    const item = byFile.get(file);
    return item ? [{ item, h }] : [];
  });

  // If the media folders change, hang whatever is there in a gentle rhythm.
  if (chosen.length < 4) {
    const rhythm = [12, 18, 14, 21, 13, 16, 19];
    chosen = items.slice(0, 7).map((item, i) => ({ item, h: rhythm[i % rhythm.length] }));
  }
  if (chosen.length === 0) return [];

  const width = chosen.reduce((sum, p) => sum + p.h * p.item.ratio, 0);
  const gaps = HANG_GAP * (chosen.length - 1);
  const scale = Math.max(0.1, (span - gaps) / width);
  return chosen.map(({ item, h }) => ({ item, h: Number((h * scale).toFixed(3)) }));
}
