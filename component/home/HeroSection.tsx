"use client";

import {
  listCatalogProductsAction,
  type Product,
} from "@/app/actions/products";
import type { Dictionary } from "@/app/dictionaries";
import { formatPrice } from "@/app/utils/format-price";
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
  /** A product on offer: what it costs now, and what it cost before. */
  product?: { price: number; originalPrice: number };
}

interface HeroSlide {
  id: string;
  /** A finished campaign banner — its text is part of the picture. */
  imageSrc: string;
  imageAlt: string;
  href: string;
}

// Banners live in /public/assets/herosilder and are made 12:5 —
// 2400 × 1000 px. The panel is that same shape on every screen (phone,
// tablet, desktop), so one picture serves them all and the whole of it
// always shows: nothing is cropped. (A banner of another shape still fills
// the panel — a 2:1 one loses about 8% off its top and bottom.)
const slides: HeroSlide[] = [
  {
    id: "grand-launch",
    imageSrc: "/assets/herosilder/banner1.png",
    imageAlt:
      "Shaajs (সাজ'স) Grand Launch — Fashion, Beauty, Lifestyle. Be you, be stylish, be Shaajs. Shop now at www.shaajs.com",
    href: "/product",
  },
  {
    id: "bogo-madness",
    imageSrc: "/assets/herosilder/banner2.png",
    imageAlt: "BOGO Madness — the biggest deal of the year",
    href: "/product",
  },
  {
    id: "puja-sale",
    imageSrc: "/assets/herosilder/banner3.png",
    imageAlt: "Puja Sale — up to 51% off",
    href: "/category/makeup",
  },
];

const HERO_AUTOPLAY_MS = 4000;
const OFFER_SLOTS = 2;
const OFFER_BASE_MS = 2000;
const OFFER_STEP_MS = 350;
// A product deal has a name and two prices to take in, so it stays longer
// than a one-line promotion.
const DEAL_BASE_MS = 3500;
// The most product deals the cards turn through, and how many products are
// looked at to find them.
const MAX_DEALS = 8;
const DEAL_SEARCH_LIMIT = 60;
// From this much off, a deal is called a hot one.
const HOT_DEAL_PERCENT = 30;

const CARD_GRADIENTS = [
  "from-(--color-black) via-[#4a0a1f] to-(--color-primary)",
  "from-[#4a0a1f] via-(--color-primary-dark) to-(--color-primary)",
  "from-(--color-black) via-(--color-black) to-(--color-primary-dark)",
];

const percentOff = (product: Product) =>
  typeof product.discountPrice === "number" &&
  product.discountPrice < product.price
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

/**
 * The shop's own deals, for the cards beside the banner: the products that
 * are discounted right now, biggest saving first, each as a card that opens
 * the product.
 */
function dealCards(products: Product[]): OfferCard[] {
  return products
    .map((product) => ({ product, off: percentOff(product) }))
    .filter(({ off }) => off > 0)
    .sort((a, b) => b.off - a.off)
    .slice(0, MAX_DEALS)
    .map(({ product, off }, index) => {
      const category =
        typeof product.category === "string" ? "" : product.category?.name;
      // A "buy this, get that free" product is a gift before it is a discount.
      const hasGift = /\bfree\b/i.test(product.title);
      return {
        id: `deal-${product._id}`,
        label: hasGift
          ? "Free Gift"
          : off >= HOT_DEAL_PERCENT
            ? "Hot Deal"
            : category || "Special Offer",
        title: product.title,
        discount: `${off}% OFF`,
        href: `/product/${product.slug || product._id}`,
        gradient: CARD_GRADIENTS[index % CARD_GRADIENTS.length],
        icon: hasGift ? Gift : off >= HOT_DEAL_PERCENT ? Zap : Tag,
        product: {
          price: product.discountPrice as number,
          originalPrice: product.price,
        },
      };
    });
}

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
    (i: number) =>
      setIndex(((i % offers.length) + offers.length) % offers.length),
    [offers.length],
  );

  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), intervalMs);
    return () => clearInterval(timer);
  }, [index, goTo, offers.length, intervalMs]);

  const offer = offers[index % offers.length];

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
            className={`group relative flex h-full flex-col justify-between overflow-hidden border border-white/10 bg-linear-to-br ${offer.gradient} p-4 text-white shadow-(--shadow-md) xl:p-5`}
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
            {offer.product ? (
              // A product on offer: its name, the saving, and what it costs
              // now beside what it cost before.
              <>
                <div className="relative z-10 max-w-[88%] text-start">
                  <p className="line-clamp-1 text-base leading-snug font-bold break-words text-white xl:line-clamp-2 xl:text-lg">
                    {offer.title}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="inline-flex rounded-full bg-(--color-secondary) px-2.5 py-1 text-xs leading-none font-extrabold text-(--color-secondary-foreground) sm:text-sm">
                      {offer.discount}
                    </span>
                    <span className="flex items-baseline gap-2 leading-none">
                      <span className="text-lg font-extrabold text-white">
                        {formatPrice(offer.product.price)}
                      </span>
                      <span className="text-xs text-white/60 line-through">
                        {formatPrice(offer.product.originalPrice)}
                      </span>
                    </span>
                  </div>
                </div>
                <offer.icon
                  aria-hidden="true"
                  strokeWidth={1}
                  size={124}
                  className="pointer-events-none absolute end-[-1.25rem] bottom-[-1.5rem] text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                />
              </>
            ) : (
              <>
                <div className="relative z-10 text-start">
                  <p className="line-clamp-1 max-w-[85%] text-base leading-snug font-bold break-words text-white xl:line-clamp-2 xl:text-xl">
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
              </>
            )}
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
  // The cards beside the banner. They open on three standing promotions and
  // switch to the shop's real deals — the products discounted right now —
  // as soon as those have loaded. With nothing discounted, the promotions stay.
  const [deals, setDeals] = useState<OfferCard[]>([]);
  useEffect(() => {
    let cancelled = false;
    void listCatalogProductsAction({ limit: DEAL_SEARCH_LIMIT }).then((res) => {
      if (cancelled || !res.ok || !res.data) return;
      setDeals(dealCards(res.data.products));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const offerCopy = dict.home.offers;
  const promotions: OfferCard[] = [
    {
      id: "skincare",
      label: offerCopy.flash_label,
      title: offerCopy.flash_title,
      discount: offerCopy.flash_discount,
      href: "/category/skincare",
      gradient: CARD_GRADIENTS[0],
      icon: Zap,
    },
    {
      id: "makeup",
      label: offerCopy.clearance_label,
      title: offerCopy.clearance_title,
      discount: offerCopy.clearance_discount,
      href: "/category/makeup",
      gradient: CARD_GRADIENTS[1],
      icon: Tag,
    },
    {
      id: "new-arrivals",
      label: offerCopy.bundle_label,
      title: offerCopy.bundle_title,
      discount: offerCopy.bundle_discount,
      href: "/product?collection=new-arrivals",
      gradient: CARD_GRADIENTS[2],
      icon: Gift,
    },
  ];

  // Each card gets its own share of the deals — every other one — so the two
  // never show the same product at once. With too few deals to share out,
  // the cards turn through the promotions instead.
  const showDeals = deals.length >= OFFER_SLOTS * 2;
  const offersFor = (slotIndex: number) =>
    showDeals
      ? deals.filter((_, index) => index % OFFER_SLOTS === slotIndex)
      : rotateOffers(
          deals.length > 0 ? [...deals, ...promotions] : promotions,
          slotIndex,
        );

  return (
    <section className="pt-3 sm:pt-4 lg:pt-5">
      <div className="container">
        {/* The banners carry the visible headline, so the page's own heading
            is for screen readers and search engines only. */}
        <h1 className="sr-only">Shaajs</h1>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-5">
          {/* Banner carousel — pauses while pointed at or focused. */}
          <div
            // The panel is the banner's own 12:5 shape at every width, so
            // its height follows from how wide it is.
            className="relative isolate aspect-[12/5] overflow-hidden rounded-(--radius-xl) bg-black shadow-(--shadow-lg) sm:rounded-(--radius-2xl)"
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
                    // The first banner is the page's main picture.
                    priority={activeSlide === 0}
                    // Full width below desktop; about 70% of the screen
                    // beside the offer cards. Next.js sends each device a
                    // copy no bigger than it needs.
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    className="object-cover"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-1.5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-3">
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

          {/* Offer cards — beside the banners on desktop only; phones and
              tablets show just the banner. */}
          {/* (No height of its own: the row is as tall as the banner, and
              the two cards share that.) */}
          <div className="hidden flex-col gap-3 lg:flex">
            {Array.from({ length: OFFER_SLOTS }).map((_, slotIndex) => (
              <OfferSlot
                // A new key when the deals arrive, so each card starts its
                // turn from the first of them.
                key={`${slotIndex}-${showDeals ? "deals" : "promotions"}`}
                offers={offersFor(slotIndex)}
                intervalMs={
                  (showDeals ? DEAL_BASE_MS : OFFER_BASE_MS) +
                  slotIndex * OFFER_STEP_MS
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
