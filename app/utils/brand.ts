import type { Brand } from "@/app/actions/brand";

/**
 * A brand's products. The catalogue has no brand filter of its own, but its
 * search matches brand names — so a brand opens as a search for its name.
 */
export function brandHref(brand: Pick<Brand, "name">) {
  return `/product?q=${encodeURIComponent(brand.name)}`;
}

/** The heading for brands that start with a digit. */
export const DIGIT_GROUP = "0–9";

export const BRAND_LETTERS = [
  DIGIT_GROUP,
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
];

/** Where a letter's brands start on the brands page. */
export function brandLetterId(letter: string) {
  return `brands-${letter === DIGIT_GROUP ? "0-9" : letter}`;
}

// A brand files under the first letter or digit of its name, whatever comes
// before it — "[SOME BY MI]" under S, "3W Clinic" under 0–9, "e.l.f." under E.
function brandLetter(name: string): string {
  const first = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]/i)?.[0];
  if (!first) return DIGIT_GROUP;
  return /[0-9]/.test(first) ? DIGIT_GROUP : first.toUpperCase();
}

const byName = (a: Brand, b: Brand) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base", numeric: true });

export interface BrandGroups {
  /** The top brands, in the order set in the dashboard. */
  top: Brand[];
  /** Every brand (top ones included) under its letter, A to Z. */
  letters: { letter: string; brands: Brand[] }[];
}

/**
 * Sorts brands the way the brands page shows them: the top brands first,
 * then all brands grouped by first letter — 0–9, A, B … Z — and
 * alphabetical within each letter.
 */
export function groupBrands(brands: Brand[]): BrandGroups {
  const byLetter = new Map<string, Brand[]>();
  for (const brand of brands) {
    const letter = brandLetter(brand.name);
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), brand]);
  }

  return {
    top: brands.filter((brand) => brand.isTopBrand),
    letters: BRAND_LETTERS.filter((letter) => byLetter.has(letter)).map(
      (letter) => ({
        letter,
        brands: (byLetter.get(letter) ?? []).sort(byName),
      }),
    ),
  };
}
