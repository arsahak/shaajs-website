"use client";

import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface Announcement {
  text: string;
  href: string;
}

const ROTATE_MS = 4000;

const arrowClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-white/60 transition-colors hover:bg-white/10 hover:text-white";

/**
 * The strip above the header: offers and notices that slide through one at a
 * time. It scrolls away with the page; pointing at it pauses the rotation.
 */
export function AnnouncementBar({ items }: { items: Announcement[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;

    const timer = setInterval(
      () => setIndex((current) => (current + 1) % items.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  const item = items[index % items.length];
  const step = (by: -1 | 1) =>
    setIndex((current) => (current + by + items.length) % items.length);

  return (
    <div
      className="bg-black text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container flex h-11 items-center gap-2">
        {items.length > 1 && (
          <button
            type="button"
            aria-label="Previous offer"
            onClick={() => step(-1)}
            className={arrowClass}
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="relative h-full min-w-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={index}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: easeSmooth }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Link
                href={item.href}
                className="truncate text-sm font-medium text-white underline-offset-4 hover:text-white hover:underline"
              >
                {item.text}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <button
            type="button"
            aria-label="Next offer"
            onClick={() => step(1)}
            className={arrowClass}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
