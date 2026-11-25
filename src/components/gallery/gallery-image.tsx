import Image from "next/image";
import type { GalleryItem } from "@/lib/data/gallery";

/**
 * next/image refuses SVG unless the optimizer is told to allow it, which is a
 * setting worth avoiding site-wide. Our own vector artwork is served directly
 * instead—it is already a few tens of KB and needs no resizing.
 */
export function GalleryImage({
  item,
  className,
  sizes,
  priority,
}: {
  item: Pick<GalleryItem, "image" | "title">;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  if (item.image.toLowerCase().endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt={item.title} className={`absolute inset-0 h-full w-full ${className}`} />
    );
  }

  return <Image src={item.image} alt={item.title} fill priority={priority} className={className} sizes={sizes} />;
}
