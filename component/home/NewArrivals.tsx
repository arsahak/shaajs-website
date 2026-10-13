import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listCategoriesAction } from "@/app/actions/category";
import {
  listCatalogProductsAction,
  type Product,
} from "@/app/actions/products";
import type { Dictionary } from "@/app/dictionaries";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  NewArrivalCard,
  type NewArrivalSlide,
} from "@/component/product/NewArrivalCard";
import {
  CATALOG_CARD_ICONS,
  toCatalogCardProduct,
} from "@/component/product/catalogProductCard";

interface NewArrivalsProps {
  dict: Dictionary;
}

// The most products the section will ask for and sort into categories.
const MAX_PRODUCTS = 100;
// With nothing marked "New Arrival" yet, the latest products stand in.
const LATEST_FALLBACK = 20;
// One card per category, up to this many (two rows of five on a desktop).
const MAX_CARDS = 10;
// Each card turns through this many of its category's products at most —
// more and the progress bars across its top get too thin to read.
const MAX_SLIDES = 8;
const BASE_INTERVAL_MS = 3000;
const INTERVAL_STEP_MS = 700;
const OTHER_CATEGORY = { id: "other", name: "More" };
// The backgrounds the cards have always had — a different colour for each
// card, moving on to the next colour with every product it turns to.
const CARD_GRADIENTS = [
  "from-(--color-secondary) to-(--color-accent)",
  "from-(--color-dark) to-(--color-info)",
  "from-(--color-primary) to-(--color-secondary)",
  "from-(--color-info) to-(--color-success)",
  "from-(--color-primary-light) to-(--color-primary)",
  "from-(--color-accent) to-(--color-warning)",
];

/**
 * The homepage's new arrivals: a row of story-style cards, one per category.
 * Each card turns through the new products of its own category — a Makeup
 * card shows only makeup — and opens the product it is showing when clicked.
 */
export async function NewArrivals({ dict }: NewArrivalsProps) {
  const [flaggedRes, categoriesRes] = await Promise.all([
    listCatalogProductsAction({ isNewArrival: true, limit: MAX_PRODUCTS }),
    listCategoriesAction(),
  ]);

  let products: Product[] = flaggedRes.ok
    ? (flaggedRes.data?.products ?? [])
    : [];
  if (products.length === 0) {
    const latestRes = await listCatalogProductsAction({
      limit: LATEST_FALLBACK,
    });
    products = latestRes.ok ? (latestRes.data?.products ?? []) : [];
  }
  // Nothing to show at all — no heading over an empty space.
  if (products.length === 0) return null;

  const categories =
    categoriesRes.ok && categoriesRes.data ? categoriesRes.data : [];
  const categoryById = new Map(
    categories.map((category) => [category._id, category]),
  );

  // A product is filed under its department — the top of its category's line
  // of parents — so "Lipstick" and "Foundation" both land on the Makeup card.
  const departmentOf = (product: Product) => {
    const id =
      typeof product.category === "string"
        ? product.category
        : product.category?._id;
    let current = id ? categoryById.get(id) : undefined;
    // The step count guards against a parent loop in the data.
    for (let step = 0; current?.parent && step < 20; step += 1) {
      const parent = categoryById.get(String(current.parent));
      if (!parent) break;
      current = parent;
    }
    return current ? { id: current._id, name: current.name } : OTHER_CATEGORY;
  };

  const byCategory = new Map<
    string,
    { id: string; name: string; slides: NewArrivalSlide[] }
  >();
  products.forEach((product, index) => {
    const category = departmentOf(product);
    const card = byCategory.get(category.id) ?? { ...category, slides: [] };
    if (card.slides.length < MAX_SLIDES) {
      const item = toCatalogCardProduct(product, index);
      const Icon = CATALOG_CARD_ICONS[index % CATALOG_CARD_ICONS.length];
      card.slides.push({
        id: item.id,
        name: item.name,
        href: item.href,
        price: item.price,
        image: item.image,
        gradient: item.gradient,
        icon: (
          <Icon
            aria-hidden="true"
            strokeWidth={1.25}
            size={64}
            className="absolute inset-0 m-auto text-white/90"
          />
        ),
      });
    }
    byCategory.set(category.id, card);
  });

  // Categories in the shop's own order; anything uncategorised goes last.
  const order = new Map(
    categories.map((category, index) => [category._id, index]),
  );
  const cards = [...byCategory.values()]
    .sort(
      (a, b) =>
        (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, MAX_CARDS)
    .map((card, cardIndex) => ({
      ...card,
      slides: card.slides.map((slide, slideIndex) => ({
        ...slide,
        gradient:
          CARD_GRADIENTS[(cardIndex + slideIndex) % CARD_GRADIENTS.length],
      })),
    }));

  return (
    <section className="pt-6 pb-8 sm:pt-8 sm:pb-10 lg:pt-10">
      <div className="container">
        <FadeIn className="flex items-end justify-between gap-4">
          <h2 className="section-title">{dict.home.new_arrivals}</h2>
          <Link
            href="/product?collection=new-arrivals"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-(--color-primary) transition-colors hover:text-(--color-primary-dark)"
          >
            {dict.common.view_all}
            <ArrowRight size={15} />
          </Link>
        </FadeIn>

        <FadeIn className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((card, cardIndex) => (
            <NewArrivalCard
              key={card.id}
              label={card.name}
              slides={card.slides}
              // A different pace for each card, so the row doesn't tick in
              // lockstep.
              intervalMs={BASE_INTERVAL_MS + (cardIndex % 5) * INTERVAL_STEP_MS}
            />
          ))}
        </FadeIn>
      </div>
    </section>
  );
}

export default NewArrivals;
