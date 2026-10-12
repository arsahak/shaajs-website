import {
  getCatalogProductAction,
  listCatalogProductsAction,
  listProductReviewsAction,
} from "@/app/actions/products";
import { getDictionary } from "@/app/dictionaries";
import { ProductCard } from "@/component/product/ProductCard";
import { ProductDetailInfo } from "@/component/product/ProductDetailInfo";
import {
  ProductGallery,
  type ProductMedia,
} from "@/component/product/ProductGallery";
import { ProductShare } from "@/component/product/ProductShare";
import {
  ProductSelectionProvider,
  type ProductOptions,
} from "@/component/product/ProductSelection";
import { ProductTabs } from "@/component/product/ProductTabs";
import {
  CATALOG_CARD_ICONS,
  resolveCatalogFallbackIcon,
  toCatalogCardProduct,
} from "@/component/product/catalogProductCard";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const badgeClass: Record<"new" | "hot" | "sale", string> = {
  new: "badge-success",
  hot: "badge-secondary",
  sale: "badge-warning",
};

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

// Converts the rich-text editor's HTML into plain text that still previews
// the author's structure — list items become "• " bullet lines and
// paragraphs/line breaks stay on their own line — instead of flattening
// everything into one run-on line.
function stripHtml(html: string): string {
  return (
    html
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/li>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|tr|ul|ol|table)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(
        /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g,
        (m) => HTML_ENTITIES[m],
      )
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      // No blank lines between blocks — paragraphs and bullets stack tight,
      // one per line, instead of leaving a gap-sized empty line between them.
      .filter((line) => line !== "")
      .join("\n")
      .trim()
  );
}

// Deterministic per-product, so repeat visits to the same product show the
// same fallback gradient/icon instead of it changing on every render.
function hashIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Product pages get their own title/description/image and URL — the layout's
// defaults point og:url and canonical at the home page, which would make
// Facebook/LinkedIn/X share previews show the home page instead.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const productRes = await getCatalogProductAction(slug);
  if (!productRes.ok || !productRes.data) return {};
  const product = productRes.data;

  const path = `/product/${product.slug}`;
  const description = stripHtml(product.shortDescription ?? "")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  const image = product.featureImage || product.galleryImages?.[0];
  const images = image ? [{ url: image, alt: product.title }] : undefined;

  return {
    title: product.title,
    description: description || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: product.title,
      description: description || undefined,
      siteName: "Shaajs",
      ...(images && { images }),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: product.title,
      description: description || undefined,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dict = await getDictionary();

  const productRes = await getCatalogProductAction(slug);
  if (!productRes.ok || !productRes.data) notFound();
  const rawProduct = productRes.data;

  const category =
    typeof rawProduct.category === "string" ? null : rawProduct.category;

  const cardIndex = hashIndex(rawProduct._id);
  const product = toCatalogCardProduct(rawProduct, cardIndex);

  const [relatedRes, reviewsRes] = await Promise.all([
    category
      ? listCatalogProductsAction({ category: category._id, limit: 8 })
      : Promise.resolve(null),
    listProductReviewsAction(rawProduct._id, { limit: 10 }),
  ]);

  let relatedPool = (relatedRes?.data?.products ?? []).filter(
    (p) => p._id !== rawProduct._id,
  );

  // Thin categories (or no category at all) shouldn't leave the section
  // empty — top up with other active products from the wider catalog.
  if (relatedPool.length < 4) {
    const fallbackRes = await listCatalogProductsAction({ limit: 8 });
    const fallbackProducts = (fallbackRes.data?.products ?? []).filter(
      (p) =>
        p._id !== rawProduct._id &&
        !relatedPool.some((existing) => existing._id === p._id),
    );
    relatedPool = [...relatedPool, ...fallbackProducts];
  }

  const related = relatedPool.slice(0, 4).map((p, index) => ({
    cardProduct: toCatalogCardProduct(p, index),
    Icon: CATALOG_CARD_ICONS[index % CATALOG_CARD_ICONS.length],
  }));

  const reviews = reviewsRes.ok ? (reviewsRes.data?.reviews ?? []) : [];
  const reviewSummary = reviewsRes.ok
    ? (reviewsRes.data?.summary ?? { averageRating: 0, totalReviews: 0 })
    : { averageRating: 0, totalReviews: 0 };

  // shortDescription comes from the dashboard's rich-text editor as HTML —
  // strip tags/entities down to plain text for this compact detail-page blurb.
  const shortDescription = stripHtml(rawProduct.shortDescription ?? "");

  // Gallery order: feature image first, then the product video (if any),
  // then the remaining gallery images, de-duplicated. The gallery autoplays
  // from the feature image into the video after a few seconds.
  const imageUrls = [
    ...new Set(
      [rawProduct.featureImage, ...(rawProduct.galleryImages ?? [])].filter(
        (src): src is string => Boolean(src),
      ),
    ),
  ];
  const media: ProductMedia[] = imageUrls.map((src) => ({
    type: "image",
    src,
  }));
  if (
    rawProduct.videoUrl &&
    (rawProduct.videoSource === "upload" ||
      rawProduct.videoSource === "youtube")
  ) {
    media.splice(Math.min(1, media.length), 0, {
      type: "video",
      source: rawProduct.videoSource,
      src: rawProduct.videoUrl,
    });
  }

  // Colors, sizes and per-size prices the shopper chooses from (all empty for
  // a product without variations, or from an API that predates them).
  const options: ProductOptions = {
    sizes: rawProduct.sizes ?? [],
    colors: (rawProduct.colors ?? []).map((color) => ({
      name: color.name,
      hex: color.hex,
      sizes: color.sizes ?? [],
      images: color.images ?? [],
    })),
    sizePrices: rawProduct.sizePrices ?? [],
  };

  // Each color's own photo joins the gallery, so it has a thumbnail and the
  // gallery can jump to it when that color is picked.
  for (const color of options.colors) {
    for (const src of color.images) {
      if (!media.some((item) => item.src === src)) {
        media.push({ type: "image", src });
      }
    }
  }

  const FallbackIcon = resolveCatalogFallbackIcon(category, cardIndex);

  return (
    <div className="container py-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-(--color-text-muted)"
      >
        <Link
          href="/"
          className="transition-colors hover:text-(--color-primary)"
        >
          {dict.nav.home}
        </Link>
        {category && (
          <>
            <ChevronRight size={14} />
            <span className="truncate">{category.name}</span>
          </>
        )}
        <ChevronRight size={14} />
        <span className="truncate font-medium text-(--color-dark)">
          {product.name}
        </span>
      </nav>

      <ProductSelectionProvider options={options}>
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery
            media={media}
            alt={product.name}
            fallbackGradient={product.gradient}
            fallback={
              <FallbackIcon
                aria-hidden="true"
                strokeWidth={1}
                size={180}
                className="absolute inset-0 m-auto text-white/90"
              />
            }
            badge={
              product.badge && (
                <span
                  className={`badge ${badgeClass[product.badge]} absolute start-3 top-3 z-10`}
                >
                  {product.badge}
                </span>
              )
            }
          />

          {/* Info */}
          <div>
            {/* The category on the left; the share button at the top right,
                level with it and beside the title. */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {category && (
                  <span className="text-xs font-semibold tracking-wide text-(--color-primary) uppercase">
                    {category.name}
                  </span>
                )}
                <h1 className="mt-1.5 text-xl font-bold text-(--color-dark) sm:text-2xl">
                  {product.name}
                </h1>
              </div>
              <ProductShare title={product.name} />
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-(--color-text-muted)">
              {/* Real figures: the approved reviews' average and count, and
                  the units actually ordered — 0 when there are none yet. */}
              <span className="font-medium text-(--color-dark)">
                ★ {reviewSummary.averageRating}
              </span>
              <span>
                ({reviewSummary.totalReviews.toLocaleString()}{" "}
                {reviewSummary.totalReviews === 1 ? "review" : "reviews"})
              </span>
              <span aria-hidden="true">·</span>
              <span>{product.sold}</span>
            </div>

            <ProductDetailInfo
              product={product}
              shortDescription={shortDescription}
              weight={product.weight}
              unit={product.unit}
              addToCartLabel={dict.common.add_to_cart}
              buyNowLabel={dict.common.buy_now}
            />
          </div>
        </div>
      </ProductSelectionProvider>

      <ProductTabs
        overviewHtml={rawProduct.overview ?? ""}
        reviews={reviews}
        reviewSummary={reviewSummary}
      />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title">Related Products</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map(({ cardProduct, Icon: RelatedIcon }) => (
              <ProductCard
                addToCartLabel={dict.common.add_to_cart}
                key={cardProduct.id}
                product={cardProduct}
                icon={
                  <RelatedIcon
                    aria-hidden="true"
                    strokeWidth={1.25}
                    size={64}
                    className="absolute inset-0 m-auto text-white/90 transition-transform duration-300 group-hover:scale-110"
                  />
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
