"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A short settle as a block scrolls in. It starts already readable, so a jump
 * link, a slow script or a screenshot never meets an empty gap, and it does
 * nothing at all for visitors who ask for reduced motion.
 */
const settle = {
  hidden: { opacity: 0.55, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Reveal({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      variants={settle}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
