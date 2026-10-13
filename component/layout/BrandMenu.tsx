"use client";

import { listBrandsAction, type Brand } from "@/app/actions/brand";
import {
  BRAND_LETTERS,
  DIGIT_GROUP,
  brandHref,
  groupBrands,
} from "@/app/utils/brand";
import { Dropdown } from "@/component/motion/Dropdown";
import { megaMenuVariants } from "@/component/motion/variants";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

export { brandHref };

interface BrandMenuProps {
  /** The top brands picked in the dashboard — sent with the page. */
  brands: Brand[];
  label: string;
  topLabel: string;
  allLabel: string;
  viewAllLabel: string;
  searchLabel: string;
  noMatchLabel: string;
  /** What the panel's Close button reads. */
  closeLabel?: string;
  className?: string;
}

/** The short label a letter group carries in the list and the index. */
const letterLabel = (letter: string) => (letter === DIGIT_GROUP ? "#" : letter);

/** A brand's number of products, as a small pill beside its name. */
function CountPill({ brand }: { brand: Brand }) {
  return (
    <span className="shrink-0 rounded bg-(--color-bg) px-1.5 py-0.5 text-[11px] leading-none tabular-nums text-(--color-text-muted)">
      {brand.productCount ?? 0}
    </span>
  );
}

function BrandLogo({ brand }: { brand: Brand }) {
  return brand.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt=""
      loading="lazy"
      className="h-14 w-full object-contain"
    />
  ) : (
    <span className="flex h-14 w-full items-center justify-center rounded-(--radius-md) bg-(--color-bg) text-lg font-bold text-(--color-dark)">
      {brand.name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * The header's "Brands" button and the wide panel it opens, in three parts:
 * a scrolling list (the top brands, then every brand under its letter, each
 * with its number of products), a # A–Z index that jumps that list to a
 * letter, and the top brands' logos.
 *
 * The full list is long, so it is fetched the first time the panel opens
 * rather than sent with every page.
 */
export function BrandMenu({
  brands: topBrands,
  label,
  topLabel,
  allLabel,
  viewAllLabel,
  searchLabel,
  noMatchLabel,
  closeLabel = "Close",
  className = "",
}: BrandMenuProps) {
  const [open, setOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<Brand[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) setQuery("");
    if (!next || allBrands || loading) return;

    setLoading(true);
    void listBrandsAction().then((result) => {
      setAllBrands(
        (result.ok && result.data ? result.data : []).filter(
          (brand) => brand.isActive,
        ),
      );
      setLoading(false);
    });
  };

  // Typing a name narrows the list to the brands that contain it; the top
  // brands section steps aside so the matches are all there is to read.
  const term = query.trim().toLowerCase();
  const letters = useMemo(() => {
    if (!allBrands) return [];
    const matching = term
      ? allBrands.filter((brand) => brand.name.toLowerCase().includes(term))
      : allBrands;
    return groupBrands(matching).letters;
  }, [allBrands, term]);
  const lettersWithBrands = new Set(letters.map(({ letter }) => letter));

  // The index scrolls the list itself (not the page) to a letter's heading.
  const jumpTo = (letter: string) => {
    const list = listRef.current;
    // (the letter's group — see data-letter below)
    const heading = list?.querySelector<HTMLElement>(
      `[data-letter="${letterLabel(letter)}"]`,
    );
    if (list && heading) {
      list.scrollTo({ top: heading.offsetTop, behavior: "smooth" });
    }
  };

  const rowClass =
    "flex items-center gap-2 rounded px-1.5 py-1 text-sm text-(--color-dark) transition-colors hover:bg-(--color-bg) hover:text-(--color-primary)";
  const headingClass =
    "mb-1 border-b border-(--color-border) pb-1.5 text-xs font-bold tracking-wider text-(--color-dark) uppercase";

  return (
    // Not `relative`: the panel hangs from the header itself, so it can run
    // the header's full width like the category menu does.
    <div
      className={className}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) close();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="btn-ghost flex items-center gap-1 rounded !px-2.5 !py-2 text-sm"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}

      <Dropdown
        show={open}
        variants={megaMenuVariants}
        className="absolute inset-x-0 top-full z-30 border-t border-(--color-border) bg-(--color-surface) text-(--color-dark) shadow-xl"
      >
        <div className="container grid grid-cols-[minmax(0,17rem)_auto_minmax(0,1fr)] gap-x-5 py-5">
          {/* 1 — search, then the list: top brands, then all brands A to Z,
              with counts. */}
          <div className="flex h-[26rem] max-h-[calc(100dvh-14rem)] flex-col">
          <div className="relative mb-3 shrink-0">
            <Search
              aria-hidden="true"
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-(--color-text-light)"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                // Results start from the top, not wherever the list was.
                listRef.current?.scrollTo({ top: 0 });
              }}
              placeholder={searchLabel}
              aria-label={searchLabel}
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-lg ps-9 pe-9 text-sm focus:border-(--color-dark) focus:shadow-none focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setQuery("")}
                className="absolute end-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full p-0 text-(--color-text-muted) hover:bg-(--color-bg) hover:text-(--color-dark)"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div
            ref={listRef}
            className="relative min-h-0 flex-1 overflow-y-auto pe-2"
          >
            {!term && topBrands.length > 0 && (
              <>
                <p className={headingClass}>{topLabel}</p>
                <ul className="mb-4">
                  {topBrands.map((brand) => (
                    <li key={brand._id}>
                      <Link
                        href={brandHref(brand)}
                        onClick={close}
                        className={rowClass}
                      >
                        <span className="min-w-0 truncate">{brand.name}</span>
                        <CountPill brand={brand} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className={headingClass}>{allLabel}</p>
            {allBrands === null ? (
              // While the full list loads.
              <div aria-hidden="true" className="space-y-2.5 pt-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span
                    key={index}
                    className="skeleton block h-4 rounded"
                    style={{ width: `${55 + ((index * 17) % 40)}%` }}
                  />
                ))}
              </div>
            ) : letters.length === 0 ? (
              <p className="px-1.5 py-3 text-sm text-(--color-text-muted)">
                {noMatchLabel}
              </p>
            ) : (
              letters.map(({ letter, brands }) => (
                // The group, not its heading, marks where a letter starts:
                // the heading sticks while scrolling, so its own position
                // moves.
                <div
                  key={letter}
                  data-letter={letterLabel(letter)}
                  className="mb-3"
                >
                  <p
                    className="sticky top-0 z-10 mb-0.5 border-b border-(--color-border) bg-(--color-surface) py-1.5 text-sm font-bold text-(--color-primary)"
                  >
                    {letterLabel(letter)}
                  </p>
                  <ul>
                    {brands.map((brand) => (
                      <li key={brand._id}>
                        <Link
                          href={brandHref(brand)}
                          onClick={close}
                          className={rowClass}
                        >
                          <span className="min-w-0 truncate">{brand.name}</span>
                          <CountPill brand={brand} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
          </div>

          {/* 2 — the index: # A–Z, jumps the list to that letter. */}
          <div className="flex h-[26rem] max-h-[calc(100dvh-14rem)] flex-col justify-between border-x border-(--color-border) px-2">
            {BRAND_LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => jumpTo(letter)}
                disabled={!lettersWithBrands.has(letter)}
                className="flex min-h-0 w-5 flex-1 items-center justify-center rounded p-0 text-[11px] leading-none font-semibold text-(--color-dark) transition-colors hover:bg-(--color-primary-faint) hover:text-(--color-primary) disabled:text-(--color-text-light) disabled:opacity-40"
              >
                {letterLabel(letter)}
              </button>
            ))}
          </div>

          {/* 3 — the top brands' logos. */}
          <div className="flex h-[26rem] max-h-[calc(100dvh-14rem)] flex-col">
            {/* The heading, with the panel's Close button at its right end —
                the panel's top right corner. */}
            <div className="relative mb-4 border-b border-(--color-border) pb-2">
              <p className="text-center text-base font-semibold tracking-wide text-(--color-dark) uppercase">
                {topLabel}
              </p>
              <button
                type="button"
                onClick={close}
                className="absolute end-0 top-1/2 flex -translate-y-[calc(50%+0.25rem)] items-center gap-1 rounded-(--radius-pill) border border-(--color-border) bg-transparent px-2.5 py-1.5 text-xs font-semibold text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <X aria-hidden="true" size={14} />
                {closeLabel}
              </button>
            </div>
            <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto lg:grid-cols-4">
              {topBrands.map((brand) => (
                <Link
                  key={brand._id}
                  href={brandHref(brand)}
                  onClick={close}
                  title={brand.name}
                  className="flex flex-col items-center gap-1.5 rounded-(--radius-md) border border-transparent p-2 text-center text-(--color-dark) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
                >
                  <BrandLogo brand={brand} />
                  <span className="w-full truncate text-xs font-medium">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/brands"
              onClick={close}
              className="mt-3 flex shrink-0 items-center justify-center gap-1.5 self-end text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
            >
              {viewAllLabel}
              <ArrowRight aria-hidden="true" size={15} className="shrink-0" />
            </Link>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
