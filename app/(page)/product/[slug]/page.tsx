import {
  getCatalogProductAction,
  listCatalogProductsAction,
  listProductReviewsAction,
} from "@/app/actions/products";
import { getDictionary } from "@/app/dictionaries";
import {
  descriptionFontStylesheet,
  descriptionFontsUsed,
} from "@/app/utils/description-fonts";
import {
  descriptionText,
  prepareOverviewHtml,
  prepareSummaryHtml,
} from "@/app/utils/description-html";
import { formatPrice } from "@/app/utils/format-price";
import { absoluteUrl, pageMetadata } from "@/app/utils/seo";
import { JsonLd } from "@/component/seo/JsonLd";
import {
  DESCRIPTION_CONTENT_STYLESHEET,
  DESCRIPTION_CONTENT_STYLESHEET_ID,
} from "@/app/utils/description-styles";
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
import { Suspense } from "react";

const badgeClass: Record<"new" | "hot" | "sale", string> = {
  new: "badge-success",
  hot: "badge-secondary",
  sale: "badge-warning",
};

// What the customer pays: the discount price when it really is lower.
const payablePrice = (product: { price: number; discountPrice?: number }) =>
  product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

// Deterministic per-product, so repeat visits to the same product show the
// same fallback gradient/icon instead of it changing on every render.
function hashIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// A product's own title, description, picture and address, for search
// results and for the preview card when its link is shared.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const productRes = await getCatalogProductAction(slug);
  if (!productRes.ok || !productRes.data) return {};
  const product = productRes.data;

  const brand =
    product.brand && typeof product.brand !== "string"
      ? product.brand.name
      : "";
  const price = payablePrice(product);
  // The same clean-up the page's own text gets, so a label or blank line
  // pasted in with the description doesn't lead the search-result snippet.
  const written = descriptionText(
    prepareSummaryHtml(product.shortDescription ?? ""),
  ).replace(/\s+/g, " ");
  // What every product page can say, whatever was written for it: the
  // price, that it is genuine, and how it is delivered.
  const offer = `Buy ${product.title} at ${formatPrice(price)} from Shaajs — 100% authentic, cash on delivery and delivery all over Bangladesh.`;
  // A short description is led with the offer; a missing one is replaced by it.
  const description =
    written.length >= 110 ? written : written ? `${offer} ${written}` : offer;

  const image = product.featureImage || product.galleryImages?.[0];

  return pageMetadata({
    // "… Price in Bangladesh" is how products are searched for here; the
    // brand leads when the title doesn't already start with it.
    title: `${
      brand && !product.title.toLowerCase().includes(brand.toLowerCase())
        ? `${brand} `
        : ""
    }${product.title} — Price in Bangladesh`,
    description,
    path: `/product/${product.slug}`,
    ...(image ? { image: { url: image, alt: product.title } } : {}),
  });
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

  const reviewsRes = await listProductReviewsAction(rawProduct._id, {
    limit: 10,
  });

  const reviews = reviewsRes.ok ? (reviewsRes.data?.reviews ?? []) : [];
  const reviewSummary = reviewsRes.ok
    ? (reviewsRes.data?.summary ?? { averageRating: 0, totalReviews: 0 })
    : { averageRating: 0, totalReviews: 0 };

  // Both descriptions come from the dashboard's rich-text editors as HTML,
  // and are shown as written — titles, lists, fonts, sizes, colors, icons —
  // once cleaned of what pasted text drags in with it. The short one is text
  // only; the overview keeps its pictures, videos and tables.
  const shortDescription = prepareSummaryHtml(
    rawProduct.shortDescription ?? "",
  );
  const overview = prepareOverviewHtml(rawProduct.overview ?? "");
  // The fonts the two descriptions are set in — the site's own three are
  // already on the page; any other is loaded here, and only on this
  // product's page.
  const descriptionFonts = [
    ...new Set([
      ...descriptionFontsUsed(shortDescription),
      ...descriptionFontsUsed(overview),
    ]),
  ].filter((font) => font.google && !font.siteVariable);

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

  // The product as search engines read it — name, pictures, price, rating —
  // which is what lets a search result show the price and stars, and the
  // trail of pages that leads here.
  const productUrl = absoluteUrl(`/product/${rawProduct.slug}`);
  const brandName =
    rawProduct.brand && typeof rawProduct.brand !== "string"
      ? rawProduct.brand.name
      : undefined;
  const breadcrumb = [
    { name: dict.nav.home, url: absoluteUrl("/") },
    ...(category
      ? [{ name: category.name, url: absoluteUrl(`/category/${category.slug}`) }]
      : []),
    { name: rawProduct.title, url: productUrl },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: rawProduct.title,
        url: productUrl,
        ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
        description:
          descriptionText(shortDescription).replace(/\s+/g, " ").slice(0, 500) ||
          rawProduct.title,
        ...(rawProduct.sku ? { sku: rawProduct.sku } : {}),
        ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
        ...(category ? { category: category.name } : {}),
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "BDT",
          price: payablePrice(rawProduct),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: "Shaajs" },
        },
        // Only with real reviews: a rating of nothing is not a rating.
        ...(reviewSummary.totalReviews > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: reviewSummary.averageRating,
                reviewCount: reviewSummary.totalReviews,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
    ],
  };

  return (
    <div className="container py-8">
      <JsonLd data={structuredData} />
      {/* React lifts these into the document's <head>: the styles the two
          descriptions are set with, and the fonts they use. */}
      <style href={DESCRIPTION_CONTENT_STYLESHEET_ID} precedence="default">
        {DESCRIPTION_CONTENT_STYLESHEET}
      </style>
      {descriptionFonts.map((font) => (
        <link
          key={font.name}
          rel="stylesheet"
          href={descriptionFontStylesheet([font])}
          precedence="default"
        />
      ))}
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
              shortDescriptionHtml={shortDescription}
              weight={product.weight}
              unit={product.unit}
              addToCartLabel={dict.common.add_to_cart}
              buyNowLabel={dict.common.buy_now}
            />
          </div>
        </div>
      </ProductSelectionProvider>

      <ProductTabs
        overviewHtml={overview}
        reviews={reviews}
        reviewSummary={reviewSummary}
      />

      {/* Loaded on its own, after the product — the page doesn't wait on it. */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          productId={rawProduct._id}
          categoryId={category?._id}
          addToCartLabel={dict.common.add_to_cart}
        />
      </Suspense>
    </div>
  );
}

const RELATED_COUNT = 4;

async function RelatedProducts({
  productId,
  categoryId,
  addToCartLabel,
}: {
  productId: string;
  categoryId?: string;
  addToCartLabel: string;
}) {
  const relatedRes = categoryId
    ? await listCatalogProductsAction({ category: categoryId, limit: 8 })
    : null;

  let relatedPool = (relatedRes?.data?.products ?? []).filter(
    (p) => p._id !== productId,
  );

  // Thin categories (or no category at all) shouldn't leave the section
  // empty — top up with other active products from the wider catalog.
  if (relatedPool.length < RELATED_COUNT) {
    const fallbackRes = await listCatalogProductsAction({ limit: 8 });
    const fallbackProducts = (fallbackRes.data?.products ?? []).filter(
      (p) =>
        p._id !== productId &&
        !relatedPool.some((existing) => existing._id === p._id),
    );
    relatedPool = [...relatedPool, ...fallbackProducts];
  }

  const related = relatedPool.slice(0, RELATED_COUNT).map((p, index) => ({
    cardProduct: toCatalogCardProduct(p, index),
    Icon: CATALOG_CARD_ICONS[index % CATALOG_CARD_ICONS.length],
  }));

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="section-title">Related Products</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {related.map(({ cardProduct, Icon: RelatedIcon }) => (
          <ProductCard
            addToCartLabel={addToCartLabel}
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
  );
}

function RelatedProductsSkeleton() {
  return (
    <section className="mt-12" aria-hidden="true">
      <div className="skeleton h-7 w-48 rounded-full" />
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: RELATED_COUNT }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)"
          >
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-3">
              <div className="skeleton h-3 w-20 rounded-full" />
              <div className="skeleton h-4 w-full rounded-full" />
              <div className="skeleton h-4 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
