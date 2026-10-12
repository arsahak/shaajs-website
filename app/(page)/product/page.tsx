import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/app/dictionaries";
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

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    collection?: string | string[];
  }>;
}) {
  const dict = await getDictionary();
  // The navbar search lands here as /product?q=…
  const { q, collection: rawCollection } = await searchParams;
  const search = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const collection =
    typeof rawCollection === "string" && rawCollection in COLLECTION_TITLES
      ? (rawCollection as ProductCollection)
      : undefined;
  const title = collection ? COLLECTION_TITLES[collection] : "All Products";

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
          key={`${collection ?? "all"}:${search}`}
          addToCartLabel={dict.common.add_to_cart}
          initialSearch={search}
          collection={collection}
        />
      </div>
    </div>
  );
}
