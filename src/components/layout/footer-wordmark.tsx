"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The full-width "KasaFrames". Its size comes from the ink of the letters
 * (measured once for Hanken Grotesk at -0.045em: the K's stem starts 0.079em
 * in, the final s ends 4.952em later), so the word runs exactly edge to edge
 * of the content column at every width and no glyph is ever cut off.
 * It rises into view once, from behind its own baseline.
 */
export function FooterWordmark() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="wordmark-fit select-none">
      {/* The mask is what gets watched: the word starts below it, clipped
          out of sight, so it could never be seen to intersect on its own. */}
      <motion.div
        className="-mx-1 overflow-hidden px-1 py-[0.6%]"
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <motion.span
          className="text-bone"
          variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          KasaFrames
        </motion.span>
      </motion.div>
    </div>
  );
}
