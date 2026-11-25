"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The headline, the promise, and one way forward. The header carries only the
 * cart and the menu, so this is the single call to action on the first screen:
 * a pill that holds a glimpse of a finished wall, the action, and what it costs.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease },
        };

  return (
    <section className="shell pt-10 sm:pt-14 lg:pt-20">
      <motion.h1 {...rise(0)} className="max-w-[15ch] text-display-xl text-balance">
        Luxury wall aesthetics <span className="text-bone/50">for modern spaces.</span>
      </motion.h1>

      <motion.div
        {...rise(0.12)}
        className="mt-12 grid gap-10 border-t border-bone/10 pt-8 lg:mt-16 lg:grid-cols-12 lg:items-center lg:gap-10"
      >
        <p className="max-w-xl text-lead font-light text-bone/60 text-pretty lg:col-span-6">
          Transform empty walls into statement compositions, curated like interior architecture and installed with
          white-glove precision.
        </p>

        <div className="lg:col-span-6 lg:flex lg:justify-end">
          <Link
            href="/book"
            className="group inline-flex max-w-full items-center gap-4 rounded-full bg-bone p-2 text-ink shadow-[0_20px_50px_-24px_rgba(244,242,237,0.35)] transition-[background-color,transform] duration-300 ease-out hover:bg-white active:scale-[0.98]"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full sm:h-14 sm:w-14">
              <Image
                src="/media/gallery-wall/black-frame-grid-six.jpg"
                alt=""
                fill
                priority
                sizes="56px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </span>
            <span className="flex min-w-0 flex-col pr-1">
              <span className="text-[16px] font-medium leading-tight tracking-[-0.02em] sm:text-[17px]">
                Book a consultation
              </span>
              <span className="mt-0.5 truncate text-[13px] text-ink/60">No fee. At home or on a video call.</span>
            </span>
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-bone sm:h-14 sm:w-14">
              <ArrowRight
                aria-hidden
                className="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-10"
              />
              <ArrowRight
                aria-hidden
                className="absolute h-5 w-5 -translate-x-10 transition-transform duration-500 ease-out group-hover:translate-x-0"
              />
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
