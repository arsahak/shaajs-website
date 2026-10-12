import type {
  Product as CatalogProduct,
  ProductCategoryRef,
  ProductUnit,
} from "@/app/actions/products";
import { getCategoryIcon } from "@/component/category/getCategoryIcon";
import {
  Camera,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  type LucideIcon,
} from "lucide-react";

// Shared by every place that renders a real backend Product as a
// <ProductCard /> (Featured Products, category product listing, ...) so the
// price/badge logic only lives — and only needs fixing — in one place.
export type CatalogCardProduct = {
  id: string;
  productId: string;
  href: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  sold: string;
  badge?: "new" | "hot" | "sale";
  gradient: string;
  weight: number;
  unit: ProductUnit;
  hasOptions: boolean;
};

export const CATALOG_CARD_ICONS: LucideIcon[] = [
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Camera,
];

const CATALOG_CARD_GRADIENTS = [
  "from-(--color-primary) to-(--color-primary-light)",
  "from-(--color-dark) to-(--color-primary)",
  "from-(--color-info) to-(--color-primary)",
  "from-(--color-secondary) to-(--color-secondary-light)",
  "from-(--color-accent) to-(--color-secondary)",
];

// Only one badge fits on a card, so priority matters: a fresh arrival is the
// most time-sensitive thing to flag (it auto-expires 30 days after being set
// on the backend, so this always reflects current status), then an active
// discount, then general trending.
export function resolveCatalogBadge(
  product: CatalogProduct,
): CatalogCardProduct["badge"] {
  if (product.isNewArrival) return "new";
  if (
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price
  ) {
    return "sale";
  }
  if (product.isTrending) return "hot";
  return undefined;
}

// A category-fitting icon when there's no real product image, falling back
// to the same rotation the grid pages use when there's no category either.
export function resolveCatalogFallbackIcon(
  category: ProductCategoryRef | null,
  index: number,
): LucideIcon {
  if (category) return getCategoryIcon(category);
  return CATALOG_CARD_ICONS[index % CATALOG_CARD_ICONS.length];
}

export function toCatalogCardProduct(
  product: CatalogProduct,
  index: number,
): CatalogCardProduct {
  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice < product.price;

  return {
    id: product.slug || product._id,
    productId: product._id,
    href: `/${product.slug || product._id}`,
    name: product.title,
    image: product.featureImage || product.galleryImages[0],
    // `price` is always what the customer actually pays; the regular price
    // only shows up (struck through) as `originalPrice` when discounted.
    price: hasDiscount ? product.discountPrice! : product.price,
    originalPrice: hasDiscount ? product.price : undefined,
    // The shop's real figures — a product nobody has reviewed or bought yet
    // honestly shows 0, 0 reviews and 0 sold.
    rating: product.averageRating ?? 0,
    reviews: product.reviewCount ?? 0,
    sold: `${(product.soldCount ?? 0).toLocaleString("en")} sold`,
    badge: resolveCatalogBadge(product),
    gradient: CATALOG_CARD_GRADIENTS[index % CATALOG_CARD_GRADIENTS.length],
    weight: product.weight,
    unit: product.unit,
    hasOptions:
      (product.colors?.length ?? 0) > 0 || (product.sizes?.length ?? 0) > 0,
  };
}
