"use client";

import * as React from "react";
import Link from "next/link";
import { CartSheet } from "@/components/layout/cart-sheet";
import { SiteMenu } from "@/components/layout/site-menu";
import { Wordmark } from "@/components/layout/wordmark";
import { cn } from "@/lib/utils";

/**
 * Just the wordmark, the cart and one Menu button. Every page lives in the
 * full-screen menu, so the bar never competes with the page under it. The
 * hairline and blur only appear once the page has scrolled beneath it.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
        scrolled ? "border-bone/[0.08] bg-ink/80 backdrop-blur-xl" : "border-transparent bg-ink",
      )}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="-m-2 rounded-full p-2" aria-label="KasaFrames home">
          <Wordmark />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartSheet />
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
