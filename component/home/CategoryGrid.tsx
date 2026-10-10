"use client";

import { listCategoriesAction, type Category } from "@/app/actions/category";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
 * The homepage's row of category cards: the store's main categories, six at a
 * time, moving on to the next six every few seconds.
 */
export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Categories whose picture failed to load — they show the plain card instead.
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      const response = await listCategoriesAction();
      if (!mounted) return;

      setCategories(response.ok && response.data ? response.data : []);
      setIsLoading(false);
    };

    void loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const topCategories = useMemo(
    () => categories.filter((category) => !category.parent),
    [categories],
  );

  // More categories than fit in the row: keep stepping through them. The list
  // wraps around, so the row is always full — the last step borrows from the
  // start instead of leaving empty slots.
  const rotates = topCategories.length > PAGE_SIZE;
  const visibleCategories = rotates
    ? Array.from(
        { length: PAGE_SIZE },
        (_, slot) =>
          topCategories[(page * PAGE_SIZE + slot) % topCategories.length],
      )
    : topCategories;

  useEffect(() => {
    if (!rotates) return;
    const timer = setInterval(() => setPage((p) => p + 1), ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotates]);

  return (
    <section className="pt-3 sm:pt-4 lg:pt-5">
      <div className="container">
        {isLoading ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div
                key={`card-skeleton-${index}`}
                aria-hidden="true"
                className="skeleton relative aspect-square rounded-(--radius-lg)"
              >
                {/* Placeholder for the name + product count caption. */}
                <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
                  <span className="block h-3 w-3/4 rounded-full bg-(--color-surface)/70" />
                  <span className="block h-2.5 w-1/3 rounded-full bg-(--color-surface)/50" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleCategories.length > 0 ? (
          <div className={GRID_CLASS}>
            {visibleCategories.map((category, slotIndex) => (
              <div
                key={`slot-${slotIndex}`}
                className="group relative aspect-square"
              >
                {/* Each slot crossfades its own old→new card independently
                    (mode="sync" lets exit/enter overlap), so replacement
                    cascades across the row instead of an all-at-once clear. */}
                <AnimatePresence mode="sync">
                  <motion.div
                    key={category._id}
                    custom={slotIndex}
                    variants={panelCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    // The gradient is the card for a category with no picture.
                    className="absolute inset-0 overflow-hidden rounded-(--radius-lg) bg-linear-to-br from-(--color-primary) to-(--color-black) shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <Link
                      href={`/category/${category.slug}`}
                      className="absolute inset-0 block"
                    >
                      {category.image && !brokenImages.has(category._id) && (
                        <Image
                          src={category.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 33vw, 17vw"
                          onError={() =>
                            setBrokenImages((broken) =>
                              new Set(broken).add(category._id),
                            )
                          }
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 px-2.5 pt-8 pb-2.5">
                        <p className="line-clamp-2 text-xs font-medium text-white sm:text-sm">
                          {category.name}
                        </p>
                        {!!category.productCount && (
                          <p className="mt-1 text-[10px] text-white/80 sm:text-xs">
                            {category.productCount} products
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
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
