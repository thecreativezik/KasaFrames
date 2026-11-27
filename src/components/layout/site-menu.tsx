"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioStatus } from "@/components/layout/studio-status";
import { Wordmark } from "@/components/layout/wordmark";
import { BRAND_PHONE_DISPLAY, BRAND_PHONE_TEL, cn, whatsappLink } from "@/lib/utils";

/** Every page, each with the picture that hangs on the menu's wall while it is pointed at. */
export const menuLinks = [
  {
    href: "/collections",
    label: "Collections",
    note: "Four frame types, every price published.",
    image: "/media/framed-matte/framed-trio-mono.jpg",
  },
  {
    href: "/gallery",
    label: "Gallery",
    note: "The portfolio, sorted by finish.",
    image: "/media/gallery-wall/editorial-gallery-wall.jpg",
  },
  {
    href: "/visualizer",
    label: "Visualizer",
    note: "Try frames on a photo of your own wall.",
    image: "/media/rooms/loft-sofa.jpg",
  },
  {
    href: "/installation",
    label: "Installation",
    note: "Set out, levelled and hung by us.",
    image: "/media/staircase/stair-cascade-quotes.jpg",
  },
  {
    href: "/about",
    label: "About",
    note: "The studio, and what it stands for.",
    image: "/media/gallery-wall/heritage-family-wall.jpg",
  },
  {
    href: "/contact",
    label: "Contact",
    note: "WhatsApp, phone or a note.",
    image: "/media/framed-matte/dining-salon-arrangement.jpg",
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The whole site behind one button. Opening it drops a curtain over the page;
 * the links rise in, and the right half becomes a lit wall where a framed
 * picture hangs for whichever page you point at, swinging gently on its wire
 * as it changes. Under reduced motion it simply fades.
 */
export function SiteMenu() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const current = Math.max(
    0,
    menuLinks.findIndex((l) => isActive(pathname, l.href)),
  );
  const [active, setActive] = React.useState(current);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const firstSwing = React.useRef(true);

  // A route change always closes the menu, whatever triggered it.
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (open) {
      setActive(current);
      firstSwing.current = true;
    }
  }, [open, current]);

  // The picture swings a little on its wire each time it is changed.
  React.useEffect(() => {
    if (firstSwing.current) {
      firstSwing.current = false;
      return;
    }
    if (reduce || !frameRef.current?.animate) return;
    frameRef.current.animate(
      [
        { transform: "rotate(-2.2deg)" },
        { transform: "rotate(1.4deg)" },
        { transform: "rotate(-0.6deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 1100, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [active, reduce]);

  const close = () => setOpen(false);
  const shown = menuLinks[active] ?? menuLinks[0];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-3 rounded-full border border-bone/20 pl-5 pr-4 text-[14px] font-medium tracking-[-0.01em] text-bone transition-[background-color,border-color,transform] duration-200 hover:border-bone/45 hover:bg-bone/[0.04] active:scale-[0.97]"
        >
          Menu
          <span aria-hidden className="flex w-4 flex-col items-end gap-[5px]">
            <span className="h-px w-4 origin-right bg-current transition-transform duration-300 ease-out group-hover:scale-x-[0.625]" />
            <span className="h-px w-4 origin-right scale-x-[0.625] bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
          </span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="menu-curtain fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-ink text-bone outline-none [scrollbar-width:thin]"
        >
          {/* A picture light over the wall on the right. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_56%_at_79%_40%,rgba(244,242,237,0.085),transparent_72%)]"
          />

          <div className="shell relative flex h-[72px] shrink-0 items-center justify-between lg:h-20">
            <DialogPrimitive.Title asChild>
              <Link href="/" onClick={close} className="-m-2 rounded-full p-2" aria-label="KasaFrames home">
                <Wordmark />
              </Link>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="group inline-flex h-11 items-center gap-3 rounded-full border border-bone/20 pl-5 pr-4 text-[14px] font-medium tracking-[-0.01em] transition-[background-color,border-color,transform] duration-200 hover:border-bone/45 hover:bg-bone/[0.04] active:scale-[0.97]">
              Close
              <span aria-hidden className="relative h-4 w-4">
                <span className="absolute left-0 top-1/2 h-px w-4 rotate-45 bg-current transition-transform duration-300 group-hover:rotate-[135deg]" />
                <span className="absolute left-0 top-1/2 h-px w-4 -rotate-45 bg-current transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </DialogPrimitive.Close>
          </div>

          <div className="shell relative grid flex-1 content-center gap-12 py-8 lg:grid-cols-12 lg:gap-10 lg:py-10">
            <nav aria-label="Main" className="lg:col-span-7">
              <ul
                className="group/menu"
                onMouseLeave={() => setActive(current)}
              >
                {menuLinks.map((item, i) => {
                  const here = isActive(pathname, item.href);
                  return (
                    <li key={item.href} className="overflow-hidden">
                      <span className="menu-rise block" style={{ "--i": i } as React.CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={close}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        aria-current={here ? "page" : undefined}
                        className="group/link flex w-fit items-start gap-3 py-1 text-[clamp(2.75rem,6.4vw,6.25rem)] leading-[1.02] tracking-[-0.045em] text-bone transition-[color,transform] duration-300 ease-out hover:translate-x-3 focus-visible:translate-x-3 focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-[0.12em] focus-visible:outline-none group-hover/menu:text-bone/25 hover:!text-bone focus-visible:!text-bone"
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "pt-[0.5em] text-[12px] tracking-normal tabular-nums transition-colors",
                            here ? "text-kasa-gold" : "text-bone/45",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </Link>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* The wall. Decorative: the links above already say where they go. */}
            <div aria-hidden className="menu-fade hidden lg:col-span-5 lg:flex lg:justify-center">
              <div className="flex w-[min(24vw,330px)] flex-col">
                <div ref={frameRef} className="origin-top">
                  <svg viewBox="0 0 100 26" className="mx-auto block w-[58%] text-bone/35" preserveAspectRatio="none">
                    <line x1="50" y1="3" x2="2" y2="26" stroke="currentColor" vectorEffect="non-scaling-stroke" />
                    <line x1="50" y1="3" x2="98" y2="26" stroke="currentColor" vectorEffect="non-scaling-stroke" />
                    <circle cx="50" cy="3" r="2.2" fill="currentColor" />
                  </svg>
                  <div className="bg-gradient-to-b from-[#1d1d1b] to-[#060606] p-[13px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(244,242,237,0.12)]">
                    <div className="bg-[#f1eee8] p-[17px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]">
                      <div className="relative aspect-[4/5] overflow-hidden bg-ink-raised">
                        {menuLinks.map((l, i) => (
                          <Image
                            key={l.href}
                            src={l.image}
                            alt=""
                            fill
                            sizes="330px"
                            className={cn(
                              "object-cover transition-opacity duration-500 ease-out",
                              i === active ? "opacity-100" : "opacity-0",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-9 flex items-baseline justify-between gap-6 border-t border-bone/10 pt-4">
                  <div>
                    <p className="text-[15px] text-bone">{shown.label}</p>
                    <p className="mt-1 text-[13px] text-bone/50">{shown.note}</p>
                  </div>
                  <p className="text-[12px] tabular-nums text-bone/45">
                    {String(active + 1).padStart(2, "0")} / {String(menuLinks.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shell relative shrink-0 pb-6 lg:pb-8">
            <div className="menu-fade grid gap-6 border-t border-bone/10 pt-6 lg:grid-cols-12 lg:items-center lg:gap-10">
              <div className="flex flex-wrap items-center gap-3 lg:col-span-4">
                <Button asChild size="lg">
                  <Link href="/book" onClick={close}>
                    Book a consultation
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-6 text-[14px] text-bone/60 lg:col-span-5">
                <li>
                  <a
                    href={whatsappLink("Hello KasaFrames — I'd love guidance on a wall project.")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-bone"
                  >
                    WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <a href={BRAND_PHONE_TEL} className="inline-flex min-h-11 items-center tabular-nums transition-colors hover:text-bone">
                    {BRAND_PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-bone"
                  >
                    Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <Link href="/policies" onClick={close} className="inline-flex min-h-11 items-center transition-colors hover:text-bone">
                    How we work
                  </Link>
                </li>
              </ul>
              <p className="text-[13px] text-bone/50 lg:col-span-3 lg:text-right">
                <StudioStatus showTime />
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
