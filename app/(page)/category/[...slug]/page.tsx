import { Package, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { listCategoriesAction, type Category } from "@/app/actions/category";
import { navCategories } from "@/app/data/categories";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { ProductGrid } from "@/component/product/ProductGrid";

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

  return {
    title: category.title,
    description: `Shop ${category.title} from trusted sellers on BongoOcean.`,
    alternates: { canonical: `/category/${slug.join("/")}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const dict = await getDictionary();

  const category = await resolveCategory(slug.join("/"));
  if (!category) notFound();

  return (
    <>
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
