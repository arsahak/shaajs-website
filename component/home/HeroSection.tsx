"use client";

import type { Dictionary } from "@/app/dictionaries";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Gift, Tag, Zap, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface HeroSectionProps {
  dict: Dictionary;
}

interface OfferCard {
  id: string;
  label: string;
  title: string;
  discount: string;
  href: string;
  gradient: string;
  icon: LucideIcon;
}

interface HeroSlide {
  id: string;
  /** A finished campaign banner — its text is part of the picture. */
  imageSrc: string;
  imageAlt: string;
  href: string;
}

// Banners live in /public/assets/herosilder. Each one fills the whole panel;
// the banners are wider than the panel, so their left and right edges are
// cropped.
const slides: HeroSlide[] = [
  {
    id: "bogo-madness",
    imageSrc: "/assets/herosilder/image1.webp",
    imageAlt: "BOGO Madness — the biggest deal of the year",
    href: "/product",
  },
  {
    id: "puja-sale",
    imageSrc: "/assets/herosilder/image2.webp",
    imageAlt: "Puja Sale — up to 51% off",
    href: "/category/makeup",
  },
  {
    id: "skincare-offer",
    imageSrc: "/assets/herosilder/image3.webp",
    imageAlt: "Flat 20% off on skincare serums",
    href: "/category/skincare",
  },
];

const PANEL_HEIGHT = "h-[390px] sm:h-[430px] lg:h-[460px]";
const HERO_AUTOPLAY_MS = 4000;
const OFFER_SLOTS = 2;
const OFFER_BASE_MS = 2000;
const OFFER_STEP_MS = 350;

/** Rotates the offer pool so each slot starts its rotation at a different item. */
function rotateOffers(offers: OfferCard[], offset: number): OfferCard[] {
  const o = offset % offers.length;
  return [...offers.slice(o), ...offers.slice(0, o)];
}

interface OfferSlotProps {
  offers: OfferCard[];
  intervalMs: number;
}

function OfferSlot({ offers, intervalMs }: OfferSlotProps) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % offers.length) + offers.length) % offers.length),
    [offers.length],
  );

  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), intervalMs);
    return () => clearInterval(timer);
  }, [index, goTo, offers.length, intervalMs]);

  const offer = offers[index];

  return (
    <div className="relative flex-1 overflow-hidden rounded-(--radius-xl)">
      <AnimatePresence>
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ duration: 0.55, ease: easeSmooth }}
          className="absolute inset-0"
        >
          <Link
            href={offer.href}
            className={`group relative flex h-full flex-col justify-between overflow-hidden border border-white/10 bg-linear-to-br ${offer.gradient} p-4 text-white shadow-(--shadow-md) sm:p-5`}
          >
            <div className="relative z-10 flex w-full items-start justify-between gap-3">
              <span className="inline-flex min-w-0 items-start gap-2 text-xs leading-snug font-bold tracking-[0.1em] text-white/75 uppercase sm:tracking-[0.14em]">
                <offer.icon
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0"
                />
                <span className="break-words">{offer.label}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-transform group-hover:translate-x-1">
                <ArrowRight size={15} />
              </span>
            </div>
            <div className="relative z-10 text-start">
              <p className="max-w-[85%] break-words text-base font-bold leading-snug text-white sm:text-lg lg:text-xl">
                {offer.title}
              </p>
              <span className="mt-2 inline-flex max-w-full rounded-full bg-(--color-secondary) px-3 py-1 text-start text-xs leading-snug font-extrabold whitespace-normal text-(--color-secondary-foreground) sm:text-sm">
                {offer.discount}
              </span>
            </div>
            <offer.icon
              aria-hidden="true"
              strokeWidth={1}
              size={124}
              className="pointer-events-none absolute end-[-1.25rem] bottom-[-1.5rem] text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
            />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function HeroSection({ dict }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (isHeroPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, HERO_AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [activeSlide, isHeroPaused]);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(((index % slides.length) + slides.length) % slides.length);
  }, []);

  const activeHero = slides[activeSlide];
  const offerCopy = dict.home.offers;
  const offers: OfferCard[] = [
    {
      id: "flash-sale",
      label: offerCopy.flash_label,
      title: offerCopy.flash_title,
      discount: offerCopy.flash_discount,
      href: "/product",
      gradient: "from-(--color-black) via-[#4a0a1f] to-(--color-primary)",
      icon: Zap,
    },
    {
      id: "clearance",
      label: offerCopy.clearance_label,
      title: offerCopy.clearance_title,
      discount: offerCopy.clearance_discount,
      href: "/product",
      gradient: "from-[#4a0a1f] via-(--color-primary-dark) to-(--color-primary)",
      icon: Tag,
    },
    {
      id: "bundle-deal",
      label: offerCopy.bundle_label,
      title: offerCopy.bundle_title,
      discount: offerCopy.bundle_discount,
      href: "/product",
      gradient: "from-(--color-black) via-(--color-black) to-(--color-primary-dark)",
      icon: Gift,
    },
  ];

  return (
    <section className="pt-3 sm:pt-4 lg:pt-5">
      <div className="container">
        {/* The banners carry the visible headline, so the page's own heading
            is for screen readers and search engines only. */}
        <h1 className="sr-only">Shaajs</h1>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-5">
          {/* Banner carousel — pauses while pointed at or focused. */}
          <div
            className={`relative isolate overflow-hidden rounded-(--radius-2xl) bg-black shadow-(--shadow-lg) ${PANEL_HEIGHT}`}
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
            onFocusCapture={() => setIsHeroPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsHeroPaused(false);
              }
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={activeHero.id}
                initial={{ opacity: 0, x: 72 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -72 }}
                transition={{ duration: 0.7, ease: easeSmooth }}
                className="absolute inset-0"
                aria-live="polite"
              >
                <Link href={activeHero.href} className="absolute inset-0 block">
                  <Image
                    src={activeHero.imageSrc}
                    alt={activeHero.imageAlt}
                    fill
                    priority={activeSlide === 0}
                    // Cropped to the panel's height, so the picture drawn is
                    // wider than the panel itself.
                    sizes="(min-width: 1024px) 115vw, 320vw"
                    className="object-cover"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`${dict.common.next} ${index + 1}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  style={{ height: 4, padding: 0 }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-7 bg-white"
                      : "w-2 bg-white/55 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Offer cards — beside the banners on desktop, below them on phones. */}
          <div className={`flex flex-col gap-3 ${PANEL_HEIGHT}`}>
            {Array.from({ length: OFFER_SLOTS }).map((_, slotIndex) => (
              <OfferSlot
                key={slotIndex}
                offers={rotateOffers(offers, slotIndex)}
                intervalMs={OFFER_BASE_MS + slotIndex * OFFER_STEP_MS}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
