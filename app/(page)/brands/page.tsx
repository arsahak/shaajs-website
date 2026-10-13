import { listBrandsAction } from "@/app/actions/brand";
import { getDictionary } from "@/app/dictionaries";
import { BrandsDirectory } from "@/component/brands/BrandsDirectory";
import { PageHero } from "@/component/common/PageHero";
import { Tags } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/brands");

/**
 * Every brand the store carries: the top brands first, then all brands under
 * their first letter, A to Z, each with its number of products — and a
 * search box to find one by name.
 */
export default async function BrandsPage() {
  const dict = await getDictionary();
  const result = await listBrandsAction();
  // Only the brands switched on in the dashboard.
  const brands = (result.ok && result.data ? result.data : []).filter(
    (brand) => brand.isActive,
  );

  return (
    <>
      <PageHero
        title={dict.nav.all_brands}
        homeLabel={dict.nav.home}
        icon={Tags}
        subtitle={dict.nav.brands_subtitle}
      />

      <div className="container py-6">
        {brands.length === 0 ? (
          <p className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center text-sm text-(--color-text-muted)">
            {dict.nav.brands_empty}
          </p>
        ) : (
          <BrandsDirectory
            brands={brands}
            labels={{
              topBrands: dict.nav.top_brands,
              allBrands: dict.nav.all_brands,
              search: dict.nav.search_brands,
              noMatch: dict.nav.brands_no_match,
            }}
          />
        )}
      </div>
    </>
  );
}
