"use client";

import type { Brand } from "@/app/actions/brand";
import {
  BRAND_LETTERS,
  brandHref,
  brandLetterId,
  groupBrands,
} from "@/app/utils/brand";
import { Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface BrandsDirectoryProps {
  /** Every brand switched on in the dashboard. */
  brands: Brand[];
  labels: {
    topBrands: string;
    allBrands: string;
    search: string;
    noMatch: string;
  };
}

const TOP_ID = "brands-top";

function BrandLogo({ brand, size }: { brand: Brand; size: number }) {
  return brand.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size }}
      className="shrink-0 rounded-(--radius-md) bg-(--color-bg) object-contain"
    />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-(--radius-md) bg-(--color-bg) text-sm font-bold text-(--color-dark)"
    >
      {brand.name.charAt(0).toUpperCase()}
    </span>
  );
}

/** How many products a brand has, the way the lists show it: "(12)". */
function ProductCount({ brand }: { brand: Brand }) {
  return (
    <span className="shrink-0 text-xs tabular-nums text-(--color-text-light)">
      ({brand.productCount ?? 0})
    </span>
  );
}

/**
 * The brands page's listing: a search box, the letters to jump by, the top
 * brands, then all brands under their first letter (0–9, A … Z), each with
 * its number of products. Typing a name narrows it to the brands that match.
 */
export function BrandsDirectory({ brands, labels }: BrandsDirectoryProps) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const matching = useMemo(
    () =>
      term
        ? brands.filter((brand) => brand.name.toLowerCase().includes(term))
        : brands,
    [brands, term],
  );
  const { top, letters } = useMemo(() => groupBrands(matching), [matching]);
  const lettersWithBrands = new Set(letters.map(({ letter }) => letter));
  // While searching, the matches are the whole page — no separate top list.
  const showTop = !term && top.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search, and the letters to jump by. Letters with no brands (or no
          matches) are shown, but off. */}
      <div className="flex flex-col gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-sm)">
        <div className="relative">
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            autoComplete="off"
            spellCheck={false}
            // 16px on phones: iOS Safari zooms the page when smaller.
            className="h-12 w-full rounded-lg ps-11 pe-11 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => setQuery("")}
              className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full p-0 text-(--color-text-muted) hover:bg-(--color-bg) hover:text-(--color-dark)"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav aria-label={labels.allBrands} className="flex flex-wrap gap-1.5">
          {showTop && (
            <a
              href={`#${TOP_ID}`}
              className="flex h-9 items-center gap-1.5 rounded-(--radius-md) bg-(--color-primary) px-3 text-sm font-semibold text-white hover:text-white"
            >
              <Star aria-hidden="true" size={14} className="shrink-0" />
              {labels.topBrands}
            </a>
          )}
          {BRAND_LETTERS.map((letter) =>
            lettersWithBrands.has(letter) ? (
              <a
                key={letter}
                href={`#${brandLetterId(letter)}`}
                className="flex h-9 min-w-9 items-center justify-center rounded-(--radius-md) border border-(--color-border) px-2 text-sm font-semibold text-(--color-dark) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                aria-hidden="true"
                className="flex h-9 min-w-9 items-center justify-center rounded-(--radius-md) px-2 text-sm font-semibold text-(--color-text-light) opacity-40"
              >
                {letter}
              </span>
            ),
          )}
        </nav>
      </div>

      {showTop && (
        <section id={TOP_ID} className="scroll-mt-44">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-(--color-dark)">
            <Star
              aria-hidden="true"
              size={18}
              className="shrink-0 fill-(--color-primary) text-(--color-primary)"
            />
            {labels.topBrands}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {top.map((brand) => (
              <Link
                key={brand._id}
                href={brandHref(brand)}
                className="flex items-center gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-3 text-(--color-dark) shadow-(--shadow-sm) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <BrandLogo brand={brand} size={44} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {brand.name}
                  </span>
                  <ProductCount brand={brand} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold text-(--color-dark)">
          {labels.allBrands}{" "}
          <span className="text-sm font-normal text-(--color-text-muted)">
            ({matching.length.toLocaleString("en")})
          </span>
        </h2>

        {letters.length === 0 ? (
          <p className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center text-sm text-(--color-text-muted)">
            {labels.noMatch}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {letters.map(({ letter, brands: letterBrands }) => (
              <section
                key={letter}
                id={brandLetterId(letter)}
                className="scroll-mt-44 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)"
              >
                <h3 className="mb-3 flex items-baseline gap-2 border-b border-(--color-border) pb-2 text-2xl font-extrabold text-(--color-primary)">
                  {letter}
                  <span className="text-xs font-normal text-(--color-text-light)">
                    {letterBrands.length.toLocaleString("en")}
                  </span>
                </h3>
                <ul className="columns-2 gap-x-6 sm:columns-3 lg:columns-4 xl:columns-5">
                  {letterBrands.map((brand) => (
                    <li key={brand._id} className="break-inside-avoid">
                      <Link
                        href={brandHref(brand)}
                        className="flex items-baseline gap-1.5 py-1.5 text-sm text-(--color-dark) transition-colors hover:text-(--color-primary)"
                      >
                        <span className="min-w-0 truncate">{brand.name}</span>
                        <ProductCount brand={brand} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandsDirectory;
