"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/cart-provider";
import { finishLabels, getProduct, materialLabels } from "@/lib/data/catalog";
import { cn, formatGhs, whatsappLink } from "@/lib/utils";

/**
 * The cart, as a sheet that slides in over the right of the page. Each line
 * shows the piece's picture and exactly what was configured; the total and
 * payment stay pinned to the bottom however long the list grows.
 */
export function CartSheet() {
  const pathname = usePathname();
  const { lines, removeLine, subtotal, clear } = useCart();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const installTotal = lines.reduce((n, l) => n + (l.installation ? l.qty * l.installationGhs : 0), 0);

  React.useEffect(() => setOpen(false), [pathname]);

  async function handleCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          // Configuration only: the server prices the cart from the catalog.
          lines: lines.map((l) => ({
            productId: l.productId,
            sizeLabel: l.sizeLabel,
            material: l.material,
            finish: l.finish,
            installation: l.installation,
            qty: l.qty,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; authorizationUrl?: string; error?: string }
        | null;

      if (response.ok && data?.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setError(data?.error ?? "We couldn't start the payment. Please try again.");
    } catch {
      setError("Network error. Check your connection or WhatsApp us instead.");
    }

    setPending(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
          className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-[14px] font-medium tracking-[-0.01em] text-bone/70 transition-[color,background-color,transform] duration-200 hover:bg-bone/[0.05] hover:text-bone active:scale-[0.97]"
        >
          Cart
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums transition-colors",
              count > 0 ? "bg-kasa-gold text-ink" : "bg-bone/10 text-bone/60",
            )}
          >
            {count}
          </span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="scrim fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]" />
        <DialogPrimitive.Content className="sheet fixed inset-y-0 right-0 z-50 flex w-full max-w-[30rem] flex-col border-l border-bone/10 bg-ink-raised text-bone shadow-lift outline-none">
          <div className="flex items-start justify-between gap-6 px-6 pb-6 pt-6 sm:px-8 sm:pt-8">
            <div>
              <DialogPrimitive.Title className="text-display-sm">
                Your selection
                {count > 0 ? (
                  <sup className="ml-1.5 align-super text-[13px] tracking-normal tabular-nums text-bone/50">{count}</sup>
                ) : null}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-[14px] text-bone/50">
                Priced from the published list, nothing added at checkout.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Close cart"
              className="group -mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bone/15 transition-[border-color,transform] duration-200 hover:border-bone/45 active:scale-[0.95]"
            >
              <span aria-hidden className="relative h-3.5 w-3.5">
                <span className="absolute left-0 top-1/2 h-px w-3.5 rotate-45 bg-bone transition-transform duration-300 group-hover:rotate-[135deg]" />
                <span className="absolute left-0 top-1/2 h-px w-3.5 -rotate-45 bg-bone transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </DialogPrimitive.Close>
          </div>

          {lines.length === 0 ? (
            <EmptyCart onNavigate={() => setOpen(false)} />
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto border-t border-bone/10 px-6 [scrollbar-width:thin] sm:px-8">
                {lines.map((line) => {
                  const product = getProduct(line.productId);
                  const each = line.priceGhs + (line.installation ? line.installationGhs : 0);
                  return (
                    <li key={line.key} className="flex gap-5 border-b border-bone/10 py-6">
                      <div className="relative h-24 w-[4.75rem] shrink-0 overflow-hidden rounded-[4px] bg-ink">
                        {product ? (
                          <Image src={product.heroImage} alt="" fill sizes="76px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[16px] leading-snug tracking-[-0.02em] text-bone">{line.productName}</p>
                          <p className="shrink-0 text-[16px] tabular-nums text-bone">{formatGhs(line.qty * each)}</p>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-bone/50">
                          {line.sizeLabel} in · {materialLabels[line.material] ?? line.material} ·{" "}
                          {finishLabels[line.finish] ?? line.finish}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                          <p className="text-[13px] tabular-nums text-bone/60">
                            {line.qty > 1 ? `${line.qty} × ${formatGhs(each)}` : "1 frame"}
                            {line.installation ? " · installed by us" : ""}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            aria-label={`Remove ${line.productName}, ${line.sizeLabel} inches`}
                            className="-mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-[13px] text-bone/50 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-bone hover:decoration-bone/60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between gap-4 py-2">
                  <a
                    href={whatsappLink(
                      `Hello KasaFrames — I'd like to confirm my cart (${lines.length} line items). Total: ${formatGhs(subtotal)}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-[13px] text-bone/70 transition-colors hover:text-bone"
                  >
                    Ask on WhatsApp <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => clear()}
                    className="-mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-[13px] text-bone/40 transition-colors hover:text-bone/80"
                  >
                    Empty the cart
                  </button>
                </li>
              </ul>

              <div className="border-t border-bone/10 bg-ink-overlay px-6 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] text-bone">Total</p>
                  <p className="text-display-sm tabular-nums">{formatGhs(subtotal)}</p>
                </div>
                <p className="mt-1 text-[13px] tabular-nums text-bone/50">
                  Frames {formatGhs(subtotal - installTotal)} ·{" "}
                  {installTotal > 0 ? `installation ${formatGhs(installTotal)}` : "installation not included"}
                </p>

                <div className="mt-5 grid gap-1">
                  <Label htmlFor="checkout-email">Email for your receipt</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button size="lg" className="mt-4 w-full" onClick={handleCheckout} disabled={pending}>
                  {pending ? "Starting payment…" : `Pay ${formatGhs(subtotal)}`}
                  {!pending ? <ArrowRight /> : null}
                </Button>
                {error ? (
                  <p role="alert" className="mt-3 text-[13px] text-red-300">
                    {error}
                  </p>
                ) : null}
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-bone/50">
                  <Lock aria-hidden className="h-3.5 w-3.5" />
                  Card and mobile money, by Paystack
                </p>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** An empty frame, waiting on the wall, with the two ways to fill it. */
function EmptyCart({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center border-t border-bone/10 px-8 pb-16 pt-10 text-center">
      <div aria-hidden className="w-36 bg-gradient-to-b from-[#1d1d1b] to-[#060606] p-2.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(244,242,237,0.12)]">
        <div className="bg-[#f1eee8] p-3">
          <div className="aspect-[4/5] border border-dashed border-ink/25" />
        </div>
      </div>
      <p className="mt-10 text-title">Nothing on the wall yet.</p>
      <p className="mt-2 max-w-[30ch] text-[14px] leading-relaxed text-bone/50">
        Choose a frame type and size, or try a few on a photo of your wall first.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/collections" onClick={onNavigate}>
            Browse collections
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/visualizer" onClick={onNavigate}>
            Open the visualizer
          </Link>
        </Button>
      </div>
    </div>
  );
}
