import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { listBestForAction } from "@/app/actions/bestFor";
import { COLLECTION_SEO, staticPageMetadata } from "@/app/data/seo";
import { getDictionary } from "@/app/dictionaries";
import { pageMetadata } from "@/app/utils/seo";
import {
  ProductGrid,
  type ProductCollection,
} from "@/component/product/ProductGrid";

// The navbar's "New Arrivals" / "Best Sellers" links (and the collections in
// the page's own sidebar): /product?collection=…
const COLLECTION_TITLES: Record<ProductCollection, string> = {
  "top-selling": "Top Selling",
  "free-delivery": "Free Delivery",
  "best-sellers": "Best Sellers",
  "new-arrivals": "New Arrivals",
};

interface ListingSearchParams {
  q?: string | string[];
  collection?: string | string[];
  bestFor?: string | string[];
}

// The homepage's "best for" cards land here as /product?bestFor=<slug> — an
// option ("skin-type-dry") or a whole group ("skin-type"). A slug that
// matches nothing gives undefined, and the page shows every product.
// Cached per request, so the metadata and the page share one lookup.
const findBestFor = cache(async (slug: string) => {
  if (!slug) return undefined;
  const res = await listBestForAction();
  const entries = res.ok ? (res.data ?? []) : [];
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) return undefined;
  const group = entry.parent
    ? entries.find((item) => item._id === entry.parent)
    : undefined;
  return {
    id: entry._id,
    slug: entry.slug,
    name: entry.name,
    groupName: group?.name,
    // "Skin Type: Dry" — an option's name alone ("Dry") says too little.
    title: group ? `${group.name}: ${entry.name}` : entry.name,
  };
});

// What the address asks the list to show: a search, a collection, a "best
// for" entry — or nothing in particular.
const readListing = async (searchParams: Promise<ListingSearchParams>) => {
  const { q, collection: rawCollection, bestFor: rawBestFor } =
    await searchParams;
  // The navbar search lands here as /product?q=…
  const search = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const collection =
    typeof rawCollection === "string" && rawCollection in COLLECTION_TITLES
      ? (rawCollection as ProductCollection)
      : undefined;
  const bestFor = await findBestFor(
    typeof rawBestFor === "string" ? rawBestFor : "",
  );
  return { search, collection, bestFor };
};

// Each way of opening the list is its own page to a search engine, with its
// own title, description and address — except a search, whose results only
// repeat products that have pages of their own.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}): Promise<Metadata> {
  const { search, collection, bestFor } = await readListing(searchParams);

  if (search) {
    return pageMetadata({
      title: `Search results for "${search}"`,
      description: `Products matching "${search}" at Shaajs — makeup, skincare, fashion and lifestyle products with cash on delivery all over Bangladesh.`,
      path: "/product",
      noindex: true,
    });
  }
  if (bestFor) {
    return pageMetadata({
      title: `${bestFor.title} — Shop Online in Bangladesh`,
      description: bestFor.groupName
        ? `Shop products picked for ${bestFor.name} (${bestFor.groupName}) at Shaajs — 100% authentic, best prices and cash on delivery all over Bangladesh.`
        : `Shop products by ${bestFor.name} at Shaajs — 100% authentic, best prices and cash on delivery all over Bangladesh.`,
      path: `/product?bestFor=${encodeURIComponent(bestFor.slug)}`,
    });
  }
  if (collection) {
    return pageMetadata({
      ...COLLECTION_SEO[collection],
      path: `/product?collection=${collection}`,
    });
  }
  return staticPageMetadata("/product");
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const dict = await getDictionary();
  const { search, collection, bestFor } = await readListing(searchParams);

  const title =
    bestFor?.title ??
    (collection ? COLLECTION_TITLES[collection] : "All Products");

  return (
    <div className="container py-8">
      {/* Product page hero */}
      <div className="relative overflow-hidden rounded-(--radius-2xl) bg-linear-to-br from-(--color-primary) to-(--color-primary-light) px-6 py-5 sm:px-8 sm:py-6">
        <div className="relative z-10">
          <h1 className="text-white">{title}</h1>
          <nav aria-label="Breadcrumb" className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
            <Link href="/" className="text-white/70 transition-colors hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight size={12} />
            <span>{title}</span>
          </nav>
        </div>

        <Package
          aria-hidden="true"
          strokeWidth={1}
          size={110}
          className="pointer-events-none absolute end-[-1rem] bottom-[-1rem] text-white/15"
        />
      </div>

      <div className="mt-6">
        <ProductGrid
          // A new search from the navbar restarts the grid on that search.
          // …and so does switching between collections.
          key={`${collection ?? "all"}:${bestFor?.id ?? "any"}:${search}`}
          addToCartLabel={dict.common.add_to_cart}
          initialSearch={search}
          collection={collection}
          bestForId={bestFor?.id}
        />
      </div>
    </div>
  );
}
