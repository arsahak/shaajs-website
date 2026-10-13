import { listCategoriesAction, type Category } from "@/app/actions/category";
import { navCategories } from "@/app/data/categories";
import { getDictionary } from "@/app/dictionaries";
import { absoluteUrl, pageMetadata } from "@/app/utils/seo";
import { PageHero } from "@/component/common/PageHero";
import { JsonLd } from "@/component/seo/JsonLd";
import { ProductGrid } from "@/component/product/ProductGrid";
import { Package, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = { params: Promise<{ slug: string[] }> };

interface ResolvedCategory {
  title: string;
  icon: LucideIcon;
  /** The matching catalogue category, when the backend has one for this slug. */
  catalog: Category | null;
}

/**
 * Category links come from the static navigation (app/data/categories.ts),
 * while products are filed under the backend's own categories. A page exists
 * when either side knows the slug; products are filtered when the backend does.
 * Cached per request so the metadata and the page share one lookup.
 */
const resolveCategory = cache(
  async (slugPath: string): Promise<ResolvedCategory | null> => {
    const path = `/category/${slugPath}`;

    const navCategory = navCategories.find(
      (category) =>
        path === category.href || path.startsWith(`${category.href}/`),
    );
    const navLabel =
      navCategory?.href === path
        ? navCategory.label
        : navCategory?.columns
            .flatMap((column) => column.links)
            .find((link) => link.href === path)?.label;

    const res = await listCategoriesAction();
    const catalog =
      (res.ok && res.data ? res.data : []).find(
        (category) => category.slug === slugPath.split("/").pop(),
      ) ?? null;

    const title = catalog?.name ?? navLabel;
    if (!title) return null;

    return { title, icon: navCategory?.icon ?? Package, catalog };
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug.join("/"));
  if (!category) notFound();

  return pageMetadata({
    // "… Price in Bangladesh" is how products are searched for here.
    title: `${category.title} — Buy Online at Best Price in Bangladesh`,
    description: `Shop ${category.title} online at Shaajs — 100% authentic products from trusted brands, best prices, cash on delivery and fast delivery all over Bangladesh.`,
    path: `/category/${slug.join("/")}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const dict = await getDictionary();

  const category = await resolveCategory(slug.join("/"));
  if (!category) notFound();

  return (
    <>
      {/* The trail of pages that leads here, for search results. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: dict.nav.home, url: absoluteUrl("/") },
            { name: "All Products", url: absoluteUrl("/product") },
            {
              name: category.title,
              url: absoluteUrl(`/category/${slug.join("/")}`),
            },
          ].map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }}
      />
      <PageHero
        title={category.title}
        homeLabel={dict.nav.home}
        icon={category.icon}
        parents={[{ label: "All Products", href: "/product" }]}
      />
      <div className="container pt-6 pb-8">
        <ProductGrid
          addToCartLabel={dict.common.add_to_cart}
          initialCategory={
            category.catalog
              ? {
                  id: category.catalog._id,
                  parentId: category.catalog.parent,
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
