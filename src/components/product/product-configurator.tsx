"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import {
  finishLabels,
  materialLabels,
  type FrameFinish,
  type FrameMaterial,
  type Product,
} from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/context/cart-provider";
import { cn, formatGhs, whatsappLink } from "@/lib/utils";

export function ProductConfigurator({ product }: { product: Product }) {
  const id = useId();
  const { addLine } = useCart();
  const [sizeLabel, setSizeLabel] = useState(product.sizes[0]?.label ?? "");
  const [material, setMaterial] = useState<FrameMaterial>(product.materials[0] ?? "wood");
  const [finish, setFinish] = useState<FrameFinish>(product.finishes[0] ?? "plain");
  const [installation, setInstallation] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product.heroImage);
  const [added, setAdded] = useState(false);

  const selectedSize = useMemo(
    () => product.sizes.find((s) => s.label === sizeLabel) ?? product.sizes[0],
    [product.sizes, sizeLabel],
  );

  const price = selectedSize?.frameGhs ?? 0;
  const installationFee = installation ? product.installationGhs : 0;
  const total = qty * (price + installationFee);
  const images = [product.heroImage, ...product.gallery];

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 4000);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-ink-raised">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 58vw"
            priority
          />
        </div>
        {images.length > 1 ? (
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.map((src, idx) => {
              const active = src === activeImage;
              return (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  aria-label={`Show image ${idx + 1} of ${images.length}`}
                  aria-pressed={active}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-tile bg-ink-raised ring-1 ring-inset transition-[opacity,transform,box-shadow] duration-200 active:scale-[0.97]",
                    active ? "ring-bone" : "opacity-60 ring-transparent hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-5 lg:pl-4">
        <div className="lg:sticky lg:top-28">
          <h1 className="text-display-md text-balance">{product.name}</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-bone/60 text-pretty">{product.description}</p>

          <div className="mt-10 flex items-baseline justify-between gap-4 border-t border-bone/10 pt-6">
            <p className="text-[13px] text-bone/50">Price per frame</p>
            <p className="text-display-sm tabular-nums">{formatGhs(price)}</p>
          </div>

          <div className="mt-8 grid gap-7">
            <div className="grid gap-1">
              <Label htmlFor={`${id}-size`}>Size</Label>
              <Select value={sizeLabel} onValueChange={setSizeLabel}>
                <SelectTrigger id={`${id}-size`}>
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.label} in · {formatGhs(s.frameGhs)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-6">
              <div className="grid gap-1">
                <Label htmlFor={`${id}-material`}>Material</Label>
                <Select value={material} onValueChange={(v) => setMaterial(v as FrameMaterial)}>
                  <SelectTrigger id={`${id}-material`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.materials.map((m) => (
                      <SelectItem key={m} value={m}>
                        {materialLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor={`${id}-finish`}>Finish</Label>
                <Select value={finish} onValueChange={(v) => setFinish(v as FrameFinish)}>
                  <SelectTrigger id={`${id}-finish`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.finishes.map((f) => (
                      <SelectItem key={f} value={f}>
                        {finishLabels[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-y border-bone/10 py-4">
              <div>
                <p id={`${id}-install-label`} className="text-[15px] text-bone">
                  Installation
                </p>
                <p className="mt-1 text-[13px] text-bone/50">
                  + {formatGhs(product.installationGhs)} per frame, set out and levelled by us
                </p>
              </div>
              <Switch
                checked={installation}
                onCheckedChange={setInstallation}
                aria-labelledby={`${id}-install-label`}
              />
            </div>

            <div className="grid grid-cols-[6rem_1fr] items-end gap-4">
              <div className="grid gap-1">
                <Label htmlFor={`${id}-qty`}>Quantity</Label>
                <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
                  <SelectTrigger id={`${id}-qty`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  addLine({
                    product,
                    sizeLabel: selectedSize?.label ?? sizeLabel,
                    priceGhs: price,
                    material,
                    finish,
                    installation,
                    installationGhs: product.installationGhs,
                    qty,
                  });
                  setAdded(true);
                }}
              >
                Add to cart · <span className="tabular-nums">{formatGhs(total)}</span>
              </Button>
            </div>

            <p aria-live="polite" className="-mt-3 min-h-5 text-[13px] text-bone/60">
              {added ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-kasa-gold" /> Added to your cart.
                </span>
              ) : null}
            </p>

            <Button asChild size="lg" variant="secondary" className="-mt-3 w-full">
              <a
                href={whatsappLink(
                  `Hello KasaFrames — I'm interested in ${product.name} (${selectedSize?.label}). Material: ${materialLabels[material]}, finish: ${finishLabels[finish]}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle />
                Ask about this on WhatsApp
              </a>
            </Button>
          </div>

          <dl className="mt-10 grid gap-6 border-t border-bone/10 pt-6 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-bone/50">Production</dt>
              <dd className="mt-2 leading-relaxed text-bone/60">
                Typically made within 3 to 7 days of your deposit, then delivered across Greater Accra.
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-bone/50">See it first</dt>
              <dd className="mt-2 leading-relaxed text-bone/60">
                Try it on a photo of your own wall in the{" "}
                <Link href="/visualizer" className="text-bone underline underline-offset-4 hover:text-white">
                  visualizer
                </Link>
                .
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
