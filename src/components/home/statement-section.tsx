"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/** From the About page: the one sentence that describes how the studio works. */
const statement =
  "We work like an interior studio, measuring light, rhythm and daily movement, then specifying framing that feels native to the room.";

/**
 * Words brighten one after another as the sentence scrolls through the
 * viewport, as in the reference. Static and fully legible under reduced motion.
 */
export function StatementSection() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = statement.split(" ");

  return (
    <section className="border-y border-bone/[0.08]">
      <div className="shell py-28 lg:py-44">
        <p ref={ref} className="max-w-6xl text-display-lg text-balance">
          {reduce
            ? statement
            : words.map((word, i) => (
                <Word key={`${word}-${i}`} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {word}
                </Word>
              ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
