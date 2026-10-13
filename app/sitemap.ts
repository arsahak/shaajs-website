import type { MetadataRoute } from "next";
import { listBestForAction } from "@/app/actions/bestFor";
import { listCatalogProductsAction } from "@/app/actions/products";
import { blogPosts } from "@/app/data/blog";
import { navCategories } from "@/app/data/categories";
import { COLLECTION_SEO } from "@/app/data/seo";
import { absoluteUrl } from "@/app/utils/seo";

// The list of pages search engines are asked to index: the fixed pages, the
// category pages, every product, the "best for" pages that have products,
// and the blog. Built when it is asked for, so a product added a minute ago
// is already in it — and so building the site never depends on the
// catalogue being reachable.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

const STATIC_PAGES: {
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/product", changeFrequency: "daily", priority: 0.9 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/help", changeFrequency: "monthly", priority: 0.4 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.4 },
  { path: "/shipping-guide", changeFrequency: "monthly", priority: 0.3 },
  { path: "/returns", changeFrequency: "monthly", priority: 0.4 },
  { path: "/orders/track", changeFrequency: "yearly", priority: 0.3 },
  { path: "/sell", changeFrequency: "monthly", priority: 0.4 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

// The most products asked for in one go, and the most pages of them read —
// far more than the shop holds, and a stop if something goes wrong.
const PRODUCT_PAGE_SIZE = 100;
const MAX_PRODUCT_PAGES = 100;

// Every product's page, with when it last changed. If the catalogue can't be
// reached, whatever was read so far is returned — a sitemap with only the
// fixed pages is better than none.
async function productEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
    const res = await listCatalogProductsAction({
      page,
      limit: PRODUCT_PAGE_SIZE,
    });
    if (!res.ok || !res.data) break;

    for (const product of res.data.products) {
      entries.push({
        url: absoluteUrl(`/product/${product.slug}`),
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    if (page >= res.data.totalPages) break;
  }
  return entries;
}

// The "best for" pages (/product?bestFor=…) that have products to show; one
// with none would be an empty page.
async function bestForEntries(): Promise<MetadataRoute.Sitemap> {
  const res = await listBestForAction();
  if (!res.ok || !res.data) return [];
  return res.data
    .filter((entry) => entry.parent && (entry.productCount ?? 0) > 0)
    .map((entry) => ({
      url: absoluteUrl(`/product?bestFor=${encodeURIComponent(entry.slug)}`),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Each category in the navigation, and each link in its menu.
  const categoryPaths = [
    ...new Set(
      navCategories.flatMap((category) => [
        category.href,
        ...category.columns.flatMap((column) =>
          column.links.map((link) => link.href),
        ),
      ]),
    ),
  ].filter((href) => href.startsWith("/category/"));

  const [products, bestFor] = await Promise.all([
    productEntries(),
    bestForEntries(),
  ]);

  return [
    ...STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...Object.keys(COLLECTION_SEO).map((collection) => ({
      url: absoluteUrl(`/product?collection=${collection}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...categoryPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products,
    ...bestFor,
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
