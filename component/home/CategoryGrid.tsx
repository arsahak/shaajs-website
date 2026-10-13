"use client";

import { homeCategories } from "@/app/data/home-categories";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// One line of cards on desktop; two rows of three on phones.
const PAGE_SIZE = 6;
const ROTATE_MS = 3000;
const GRID_CLASS = "grid grid-cols-3 gap-3 sm:grid-cols-6";

// Each grid slot crossfades old → new on its own (via the `custom` slot
// index below), staggered slightly per slot, instead of the whole grid
// clearing out and refilling together — so there's never a moment where
// the row looks empty mid-transition.
const panelCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: (slotIndex: number) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: easeSmooth, delay: slotIndex * 0.06 },
  }),
  exit: (slotIndex: number) => ({
    opacity: 0,
    scale: 0.94,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "easeIn", delay: slotIndex * 0.06 },
  }),
};

/**
 * The homepage's row of "shop by need" cards (oily skin, combo offers, party
 * wear, …): the fixed list in app/data/home-categories.ts, six at a time,
 * moving on to the next six every few seconds.
 */
export function CategoryGrid() {
  const [page, setPage] = useState(0);
  // Categories whose picture failed to load — they show the plain card instead.
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // More categories than fit in the row: keep stepping through them. The list
  // wraps around, so the row is always full — the last step borrows from the
  // start instead of leaving empty slots.
  const rotates = homeCategories.length > PAGE_SIZE;
  const visibleCategories = rotates
    ? Array.from(
        { length: PAGE_SIZE },
        (_, slot) =>
          homeCategories[(page * PAGE_SIZE + slot) % homeCategories.length],
      )
    : homeCategories;

  useEffect(() => {
    if (!rotates) return;
    const timer = setInterval(() => setPage((p) => p + 1), ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotates]);

  return (
    <section className="pt-3 sm:pt-4 lg:pt-5">
      <div className="container">
        {visibleCategories.length > 0 ? (
          <div className={GRID_CLASS}>
            {visibleCategories.map((category, slotIndex) => {
              const Icon = category.icon;
              const showImage =
                !!category.image && !brokenImages.has(category.href);

              return (
                <div
                  key={`slot-${slotIndex}`}
                  className="group relative aspect-square"
                >
                  {/* Each slot crossfades its own old→new card independently
                    (mode="sync" lets exit/enter overlap), so replacement
                    cascades across the row instead of an all-at-once clear. */}
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={category.href}
                      custom={slotIndex}
                      variants={panelCardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      // The gradient is the card for a category with no picture.
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, ${category.colors[0]}, ${category.colors[1]})`,
                      }}
                      className="absolute inset-0 overflow-hidden rounded-(--radius-lg) shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <Link
                        href={category.href}
                        className="absolute inset-0 block"
                      >
                        {showImage ? (
                          <Image
                            src={category.image as string}
                            alt=""
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 33vw, 17vw"
                            onError={() =>
                              setBrokenImages((broken) =>
                                new Set(broken).add(category.href),
                              )
                            }
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Icon
                            aria-hidden="true"
                            strokeWidth={1.25}
                            className="absolute top-[42%] left-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 text-white/30 transition-transform duration-300 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 px-2.5 pt-8 pb-2.5">
                          <p className="line-clamp-2 text-xs font-medium text-white sm:text-sm">
                            {category.title}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-(--color-text-muted)">
            No categories available
          </p>
        )}
      </div>
    </section>
  );
}

export default CategoryGrid;
