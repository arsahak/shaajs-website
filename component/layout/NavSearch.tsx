"use client";

import {
  suggestProductsAction,
  type ProductSuggestion,
} from "@/app/actions/products";
import { PRODUCT_SEARCH_EVENT } from "@/app/utils/product-search-event";
import { Dropdown } from "@/component/motion/Dropdown";
import { formatPrice } from "@/app/utils/format-price";
import { ArrowRight, Camera, Loader2, Package, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

interface NavSearchProps {
  /** Keeps element ids unique between the desktop and phone search boxes. */
  idPrefix: string;
  placeholder: string;
  /** Text on the submit button, e.g. "Search". */
  searchLabel: string;
  autoFocus?: boolean;
  /**
   * Render suggestions in the page flow instead of as a floating panel — for
   * the phone search, which sits in a container that clips anything floating.
   */
  inline?: boolean;
  className?: string;
  /** Called after the visitor goes to a product or the results page. */
  onNavigate?: () => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

type Suggestions =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; query: string; products: ProductSuggestion[]; total: number };

/**
 * The header search: the pill-shaped field (search icon + text + submit) with
 * live product suggestions underneath. Submitting opens the product listing
 * filtered to the search (/product?q=…).
 */
export function NavSearch({
  idPrefix,
  placeholder,
  searchLabel,
  autoFocus,
  inline = false,
  className = "",
  onNavigate,
}: NavSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions>({ state: "idle" });
  const [open, setOpen] = useState(false);
  // Keyboard highlight: 0…n-1 are products, n is the "see all results" row.
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const listId = `${idPrefix}-search-suggestions`;

  // Look suggestions up shortly after the visitor stops typing. A newer
  // keystroke cancels the pending lookup, so only the latest answer is shown.
  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await suggestProductsAction(trimmed);
      if (cancelled) return;
      setSuggestions({
        state: "ready",
        query: trimmed,
        products: res.ok && res.data ? res.data.products : [],
        total: res.ok && res.data ? res.data.total : 0,
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setOpen(true);
    setSuggestions(
      value.trim().length < MIN_QUERY_LENGTH
        ? { state: "idle" }
        : { state: "loading" },
    );
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const goToResults = () => {
    if (!trimmed) return;
    close();
    onNavigate?.();
    window.dispatchEvent(
      new CustomEvent(PRODUCT_SEARCH_EVENT, { detail: trimmed }),
    );
    router.push(`/product?q=${encodeURIComponent(trimmed)}`);
  };

  const goToProduct = (product: ProductSuggestion) => {
    close();
    setQuery("");
    setSuggestions({ state: "idle" });
    onNavigate?.();
    router.push(`/product/${product.slug || product._id}`);
  };

  const products = suggestions.state === "ready" ? suggestions.products : [];
  const showPanel = open && suggestions.state !== "idle";
  // Products, plus the "see all results" row whenever there are any.
  const rowCount = products.length > 0 ? products.length + 1 : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const highlighted = products[activeIndex];
    if (showPanel && highlighted) goToProduct(highlighted);
    else goToResults();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!showPanel || rowCount === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % rowCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? rowCount - 1 : index - 1));
    }
  };

  const panel = (
    <div
      id={listId}
      role="listbox"
      aria-label="Search suggestions"
      // Keep focus in the text field while a suggestion is being clicked —
      // otherwise the field blurs and the panel closes before the click lands.
      onMouseDown={(event) => event.preventDefault()}
      className={
        inline
          ? "mt-3 overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)"
          : "overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xl)"
      }
    >
      {suggestions.state === "loading" && (
        <p className="flex items-center gap-2 px-4 py-4 text-sm text-(--color-text-muted)">
          <Loader2 size={16} className="animate-spin" />
          Searching…
        </p>
      )}

      {suggestions.state === "ready" && products.length === 0 && (
        <p className="px-4 py-4 text-sm text-(--color-text-muted)">
          No products found for “{suggestions.query}”.
        </p>
      )}

      {suggestions.state === "ready" && products.length > 0 && (
        <>
          {products.map((product, index) => {
            const hasDiscount =
              typeof product.discountPrice === "number" &&
              product.discountPrice < product.price;

            return (
              <Link
                key={product._id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                href={`/product/${product.slug || product._id}`}
                onClick={(event) => {
                  event.preventDefault();
                  goToProduct(product);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-start transition-colors hover:bg-(--color-bg) ${
                  index === activeIndex ? "bg-(--color-bg)" : ""
                }`}
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white text-(--color-text-light)">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  ) : (
                    <Package size={18} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-(--color-dark)">
                    {product.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-(--color-primary)">
                      {formatPrice(
                        hasDiscount ? product.discountPrice! : product.price,
                      )}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-(--color-text-muted) line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            );
          })}

          <button
            type="submit"
            id={`${listId}-${products.length}`}
            role="option"
            aria-selected={activeIndex === products.length}
            className={`flex w-full items-center justify-between gap-3 rounded-none border-t border-(--color-border) px-4 py-3 text-sm font-semibold text-(--color-primary) hover:bg-(--color-bg) ${
              activeIndex === products.length ? "bg-(--color-bg)" : ""
            }`}
          >
            <span className="truncate">
              See all {suggestions.total} results for “{suggestions.query}”
            </span>
            <ArrowRight size={16} className="shrink-0" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      // Close when focus leaves the whole search (field and suggestions).
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      className={`relative ${className}`}
    >
      <label htmlFor={`${idPrefix}-search`} className="sr-only">
        {placeholder}
      </label>

      <div className="flex h-[46px] w-full items-stretch overflow-hidden rounded-full border border-(--color-border) bg-white shadow-(--shadow-sm) transition-all focus-within:border-(--color-primary) focus-within:bg-(--color-surface) focus-within:shadow-[0_0_0_3px_var(--color-primary-faint)]">
        {/* Clicking the icon puts the cursor in the search field. */}
        <label
          htmlFor={`${idPrefix}-search`}
          className="flex h-full w-[50px] shrink-0 cursor-text items-center justify-center bg-(--color-border) text-(--color-text-muted)"
        >
          <Camera aria-hidden="true" size={20} />
        </label>
        {/* Search by image is parked until it has a backend — for now the
            camera above only puts the cursor in the search field. The working
            button, for when image search exists:
        <label
          htmlFor={`${idPrefix}-image-search`}
          aria-label="Search by image"
          title="Search by image"
          className="flex h-full w-[50px] shrink-0 cursor-pointer items-center justify-center bg-(--color-border) text-(--color-text-muted) transition-colors hover:bg-(--color-primary-faint) hover:text-(--color-primary)"
        >
          <Camera size={20} />
        </label>
        <input
          id={`${idPrefix}-image-search`}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        */}
        <input
          id={`${idPrefix}-search`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeIndex >= 0
              ? `${listId}-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          enterKeyHint="search"
          // 16px on phones so iOS doesn't zoom the page on focus.
          className="w-full min-w-0 border-0 bg-transparent px-3 py-3 text-base shadow-none outline-none placeholder:text-(--color-text-light) md:text-sm"
        />
        <button
          type="submit"
          className="btn-primary me-1 h-[38px] shrink-0 self-center rounded-full px-5"
        >
          <Sparkles aria-hidden="true" size={16} />
          {searchLabel}
        </button>
      </div>

      {inline ? (
        showPanel && panel
      ) : (
        <Dropdown
          show={showPanel}
          className="absolute inset-x-0 top-full z-50 mt-2"
        >
          {panel}
        </Dropdown>
      )}
    </form>
  );
}

export default NavSearch;
