"use client";

import { DescriptionIcon } from "@/component/icons/DescriptionIcon";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** One "best for" card: an option, with the look the dashboard gave it. */
export interface BestForCard {
  id: string;
  name: string;
  /** The group the option belongs to ("Skin Type" for "Dry"). */
  groupName: string;
  href: string;
  /** Shown when there is no picture, or it fails to load. */
  icon?: string;
  image?: string;
  /** Background gradient, top-left → bottom-right. */
  colors: [from: string, to: string];
}

interface BestForCardsProps {
  cards: BestForCard[];
}

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
 * The homepage's row of "best for" cards (dry skin, party wear, gifts for
 * her, …): six at a time, moving on to the next six every few seconds until
 * every card has had its turn, then round again. A card opens the products
 * tagged with it.
 */
export function BestForCards({ cards }: BestForCardsProps) {
  const [page, setPage] = useState(0);
  // Cards whose picture failed to load — they show their icon instead.
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // More cards than fit in the row: keep stepping through them. The list
  // wraps around, so the row is always full — the last step borrows from the
  // start instead of leaving empty slots.
  const rotates = cards.length > PAGE_SIZE;
  const visibleCards = rotates
    ? Array.from(
        { length: PAGE_SIZE },
        (_, slot) => cards[(page * PAGE_SIZE + slot) % cards.length],
      )
    : cards;

  useEffect(() => {
    if (!rotates) return;
    const timer = setInterval(() => setPage((p) => p + 1), ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotates]);

  return (
    <div className={GRID_CLASS}>
      {visibleCards.map((card, slotIndex) => {
        const showImage = !!card.image && !brokenImages.has(card.id);

        return (
          <div key={`slot-${slotIndex}`} className="group relative aspect-square">
            {/* Each slot crossfades its own old→new card independently
                (mode="sync" lets exit/enter overlap), so replacement
                cascades across the row instead of an all-at-once clear. */}
            <AnimatePresence mode="sync">
              <motion.div
                key={card.id}
                custom={slotIndex}
                variants={panelCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                // The gradient is the card; the picture or icon sits on it.
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${card.colors[0]}, ${card.colors[1]})`,
                }}
                className="absolute inset-0 overflow-hidden rounded-(--radius-lg) shadow-sm transition-shadow hover:shadow-lg"
              >
                <Link href={card.href} className="absolute inset-0 block">
                  {showImage ? (
                    // A picture takes the icon's place, with the card's
                    // color all round it.
                    <div className="absolute top-[42%] left-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={card.image as string}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 20vw, 10vw"
                        onError={() =>
                          setBrokenImages((broken) =>
                            new Set(broken).add(card.id),
                          )
                        }
                        className="object-contain drop-shadow-md"
                      />
                    </div>
                  ) : (
                    <DescriptionIcon
                      name={card.icon}
                      strokeWidth={1.25}
                      className="absolute top-[42%] left-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 text-white/30 transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 px-2.5 pt-8 pb-2.5">
                    {/* Which group the name belongs to — "Dry" alone could
                        be skin or hair. */}
                    <p className="truncate text-[10px] leading-tight font-medium tracking-wide text-white/70 uppercase">
                      {card.groupName}
                    </p>
                    <p className="line-clamp-2 text-xs font-medium text-white sm:text-sm">
                      {card.name}
                    </p>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default BestForCards;
