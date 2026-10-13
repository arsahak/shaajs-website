"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { easeSmooth } from "@/component/motion/variants";
import { LinkPendingOverlay } from "@/component/product/LinkPendingOverlay";
import { formatPrice } from "@/app/utils/format-price";

export interface NewArrivalSlide {
  id: string;
  name: string;
  href: string;
  price: number;
  /** The product's photo, shown on the coloured background; without one the icon is. */
  image?: string;
  gradient: string;
  /** Pre-rendered on the server — Lucide icon components can't cross the server/client boundary as a prop. */
  icon: ReactNode;
}

interface NewArrivalCardProps {
  /** The category every product on this card belongs to, shown on the card. */
  label?: string;
  slides: NewArrivalSlide[];
  /** Rotation speed for this card, in ms — vary per card so a row of cards doesn't tick in lockstep. */
  intervalMs?: number;
}

export function NewArrivalCard({
  label,
  slides,
  intervalMs = 3500,
}: NewArrivalCardProps) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), intervalMs);
    return () => clearInterval(timer);
  }, [index, goTo, slides.length, intervalMs]);

  const slide = slides[index];

  return (
    <Link
      href={`/product/${slide.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-(--radius-2xl) transition-shadow hover:shadow-lg"
    >
      {slides.length > 1 && (
        <div className="absolute inset-x-2 top-2 z-20 flex gap-1">
          {slides.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              {i < index && <div className="h-full w-full bg-white" />}
              {i === index && (
                <motion.div
                  key={index}
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: intervalMs / 1000, ease: "linear" }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-x-2.5 top-6 z-10 flex items-center justify-between gap-2">
        <span className="badge badge-success shrink-0">new</span>
        {/* Which category this card is turning through. */}
        {label && (
          <span className="min-w-0 truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] leading-none font-semibold text-white backdrop-blur-sm">
            {label}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.6, ease: easeSmooth }}
          // Always the card's coloured background; the product's photo sits
          // on it in a rounded white tile, clear of the name and price below.
          className={`absolute inset-0 bg-linear-to-br ${slide.gradient}`}
        >
          {slide.image ? (
            <div className="absolute inset-x-3 top-14 bottom-[5.25rem] overflow-hidden rounded-(--radius-xl) bg-white shadow-lg">
              <Image
                src={slide.image}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            slide.icon
          )}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 pt-10 pb-3">
            <p className="line-clamp-2 text-xs font-semibold text-white sm:text-sm">{slide.name}</p>
            <span className="price mt-1 block text-white">{formatPrice(slide.price)}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      <LinkPendingOverlay />
    </Link>
  );
}

export default NewArrivalCard;
