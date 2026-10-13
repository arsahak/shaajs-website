"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "./variants";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport"> {
  delay?: number;
  /** Re-trigger every time the element enters the viewport instead of only once. */
  repeat?: boolean;
}

/**
 * Reveals its children with a smooth fade + slide-up as they scroll into view.
 * Use for hero sections, product grids, footer columns, etc.
 */
export function FadeIn({ children, delay = 0, repeat = false, transition, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      // Revealed as soon as any part is on screen. (Waiting until it was 80px
      // in left a blank gap wherever a block only peeked into the first screen.)
      viewport={{ once: !repeat, amount: "some" }}
      variants={fadeInUp}
      transition={{ delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
