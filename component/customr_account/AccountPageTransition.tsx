"use client";

import { easeSmooth } from "@/component/motion/variants";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Brings an account page's content in with a short fade and rise, so moving
 * between Profile, Orders and Settings feels like one screen changing rather
 * than a new page loading.
 */
export function AccountPageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

export default AccountPageTransition;
