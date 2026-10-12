"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Award,
  ChevronDown,
  Flame,
  Loader2,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { listBrandsAction, type Brand } from "@/app/actions/brand";
import { listCategoriesAction, type Category } from "@/app/actions/category";
import {
  getProductPriceRangeAction,
  listCatalogProductsAction,
  type ListProductsParams,
} from "@/app/actions/products";
import { PRODUCT_SEARCH_EVENT } from "@/app/utils/product-search-event";
import { getCategoryIcon } from "@/component/category/getCategoryIcon";
import { FadeIn } from "@/component/motion/FadeIn";
import { ProductCard } from "@/component/product/ProductCard";
import {
  CATALOG_CARD_ICONS,
  toCatalogCardProduct,
  type CatalogCardProduct,
} from "@/component/product/catalogProductCard";

interface ProductGridProps {
  addToCartLabel: string;
  /** Opens the grid already filtered to this category (category pages). */
  initialCategory?: { id: string; parentId?: string | null };
  /** Opens the grid on this search (the navbar search, /product?q=…). */
  initialSearch?: string;
  /** Opens the grid on one collection (/product?collection=…). */
  collection?: ProductCollection;
}

export type ProductCollection =
  | "top-selling"
  | "free-delivery"
  | "best-sellers"
  | "new-arrivals";

// The collections listed above the categories, in this order, and the
// product flag (ticked in the dashboard's "Visibility & Flags") each one
// filters on.
const COLLECTIONS: {
  key: ProductCollection;
  label: string;
  icon: LucideIcon;
  params: ListProductsParams;
}[] = [
  {
    key: "top-selling",
    label: "Top Selling",
    icon: Flame,
    params: { isTrending: true },
  },
  {
    key: "free-delivery",
    label: "Free Delivery",
    icon: Truck,
    params: { isFreeDelivery: true },
  },
  {
    key: "best-sellers",
    label: "Best Selling",
    icon: Award,
    params: { isBestSeller: true },
  },
  {
    key: "new-arrivals",
    label: "New Arrivals",
    icon: Sparkles,
    params: { isNewArrival: true },
  },
];

const SORT_OPTIONS = [
  { value: "default", label: "Sort: Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// The UI keeps its own short sort values; the backend has its own naming.
const SORT_PARAM: Record<SortValue, ListProductsParams["sort"]> = {
  default: "default",
  price_asc: "price-low",
  price_desc: "price-high",
};

const PAGE_SIZE = 20;
// Searching starts this long after the visitor stops typing.
const SEARCH_DEBOUNCE_MS = 350;
const SKELETON_COUNT = 12;
// The brand list is long — this many are shown until a name is typed.
const BRAND_LIST_LIMIT = 60;

// Everything that decides which products are shown.
interface Filters {
  categoryId: string | null;
  collection: ProductCollection | null;
  brandId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  search: string;
  sort: SortValue;
}

const toParams = (filters: Filters, page: number): ListProductsParams => ({
  page,
  limit: PAGE_SIZE,
  sort: SORT_PARAM[filters.sort],
  category: filters.categoryId ?? undefined,
  brand: filters.brandId ?? undefined,
  minPrice: filters.minPrice ?? undefined,
  maxPrice: filters.maxPrice ?? undefined,
  search: filters.search || undefined,
  ...(COLLECTIONS.find(({ key }) => key === filters.collection)?.params ?? {}),
});

const sideItemClass = (active: boolean) =>
  `flex w-full items-center justify-start gap-2 rounded-(--radius-md) border-s-2 py-2.5 ps-2.5 pe-2 text-start text-sm font-medium transition-colors ${
    active
      ? "border-(--color-primary) bg-(--color-primary-faint) text-(--color-primary)"
      : "border-transparent text-(--color-dark) hover:bg-(--color-bg)"
  }`;

const cardClass =
  "rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4";

// Each of the slider's two range inputs: laid over the whole track and
// see-through, letting clicks pass — only its round handle can be grabbed.
// The handle is a white disc with a small grey dot in the middle. (Every
// class is written out in full: Tailwind only makes the ones it can read.)
const PRICE_HANDLE_CLASS = [
  "pointer-events-none absolute inset-0 m-0 h-full w-full appearance-none rounded-none border-0 bg-transparent p-0 shadow-none focus:border-0 focus:bg-transparent focus:shadow-none",
  "[&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:size-[22px] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[radial-gradient(circle,#b9b9b9_0_3px,#ffffff_3.5px)] [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.28)] [&::-webkit-slider-thumb]:pointer-events-auto",
  "[&::-moz-range-thumb]:size-[22px] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[radial-gradient(circle,#b9b9b9_0_3px,#ffffff_3.5px)] [&::-moz-range-thumb]:shadow-[0_1px_6px_rgba(0,0,0,0.28)] [&::-moz-range-thumb]:pointer-events-auto",
].join(" ");

/**
 * The price range, shown first, above the categories: one track with two
 * round handles, and the two chosen prices underneath. Dragging a handle
 * moves its price as it goes; the products reload when it is let go.
 */
function PriceFilter({
  bounds,
  min,
  max,
  onApply,
}: {
  /** The lowest and highest price in the shop; `null` while loading. */
  bounds: { min: number; max: number } | null;
  min: number | null;
  max: number | null;
  onApply: (min: number | null, max: number | null) => void;
}) {
  const floor = bounds?.min ?? 0;
  const ceiling = bounds?.max ?? 0;
  const clamp = (value: number) => Math.min(ceiling, Math.max(floor, value));
  const [low, setLow] = useState(clamp(min ?? floor));
  const [high, setHigh] = useState(clamp(max ?? ceiling));

  if (!bounds) {
    return (
      <div className="animate-pulse">
        <div className="h-1.5 rounded-full bg-(--color-border)" />
        <div className="mt-4 flex justify-between">
          <span className="h-4 w-12 rounded bg-(--color-border)" />
          <span className="h-4 w-14 rounded bg-(--color-border)" />
        </div>
      </div>
    );
  }

  const span = Math.max(1, ceiling - floor);
  const percent = (value: number) => ((value - floor) / span) * 100;
  const money = (value: number) => `৳ ${value.toLocaleString("en")}`;

  // A handle resting at its end of the track means "no limit" on that side.
  const commit = () =>
    onApply(low <= floor ? null : low, high >= ceiling ? null : high);

  const handleProps = {
    type: "range" as const,
    min: floor,
    max: ceiling,
    step: 1,
    onMouseUp: commit,
    onTouchEnd: commit,
    onKeyUp: commit,
    className: PRICE_HANDLE_CLASS,
  };

  return (
    <div>
      <div className="relative mx-[11px] h-6">
        <div className="absolute inset-x-[-11px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--color-border)" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--color-primary)"
          style={{
            insetInlineStart: `${percent(low)}%`,
            insetInlineEnd: `${100 - percent(high)}%`,
          }}
        />
        {/* The inputs run 11px past the track each side, so a handle's
            centre — not its edge — sits on the price it stands for. */}
        <div className="absolute inset-x-[-11px] inset-y-0">
          <input
            {...handleProps}
            aria-label="Minimum price"
            value={low}
            onChange={(event) =>
              setLow(Math.min(Number(event.target.value), high))
            }
            // With both handles at the top end, this one must stay reachable.
            style={{ zIndex: percent(low) > 90 ? 4 : 2 }}
          />
          <input
            {...handleProps}
            aria-label="Maximum price"
            value={high}
            onChange={(event) =>
              setHigh(Math.max(Number(event.target.value), low))
            }
            style={{ zIndex: 3 }}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-medium text-(--color-dark)">
        <span>{money(low)}</span>
        <span>{money(high)}</span>
      </div>
    </div>
  );
}

/** The brand list: a search box, then names with their number of products. */
function BrandFilter({
  brands,
  loading,
  activeId,
  onPick,
}: {
  brands: Brand[];
  loading: boolean;
  activeId: string | null;
  onPick: (id: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const matching = useMemo(
    () =>
      term
        ? brands.filter((brand) => brand.name.toLowerCase().includes(term))
        : brands,
    [brands, term],
  );
  // The chosen brand stays in view even when it is past the cut-off.
  const shown = useMemo(() => {
    const list = matching.slice(0, BRAND_LIST_LIMIT);
    const active = matching.find((brand) => brand._id === activeId);
    return active && !list.includes(active) ? [active, ...list] : list;
  }, [matching, activeId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`brand-skeleton-${i}`}
            className="h-7 w-full animate-pulse rounded-(--radius-md) bg-(--color-border)"
          />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return <p className="py-2 text-sm text-(--color-text-muted)">No brands yet.</p>;
  }

  return (
    <>
      <div className="relative">
        <Search
          aria-hidden="true"
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-(--color-text-light)"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search brands…"
          aria-label="Search brands"
          autoComplete="off"
          spellCheck={false}
          className="h-10 w-full rounded-lg ps-9 pe-3 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
        />
      </div>

      <div className="mt-2 flex max-h-72 flex-col gap-0.5 overflow-y-auto pe-1">
        {shown.map((brand) => {
          const active = brand._id === activeId;
          return (
            <button
              key={brand._id}
              type="button"
              aria-pressed={active}
              // Picking the chosen brand again takes the filter off.
              onClick={() => onPick(active ? null : brand._id)}
              className={`flex w-full items-center justify-start gap-2 rounded-(--radius-md) px-2 py-1.5 text-start text-sm transition-colors ${
                active
                  ? "bg-(--color-primary-faint) font-semibold text-(--color-primary)"
                  : "font-normal text-(--color-text-muted) hover:bg-(--color-bg) hover:text-(--color-dark)"
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{brand.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-(--color-text-light)">
                {brand.productCount ?? 0}
              </span>
            </button>
          );
        })}
        {shown.length === 0 && (
          <p className="px-2 py-2 text-sm text-(--color-text-muted)">
            No brands match.
          </p>
        )}
      </div>

      {matching.length > shown.length && (
        <p className="mt-2 text-xs text-(--color-text-light)">
          {(matching.length - shown.length).toLocaleString("en")} more — search
          to find a brand.
        </p>
      )}
      <Link
        href="/brands"
        className="mt-2 inline-flex text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
      >
        View all brands
      </Link>
    </>
  );
}

export function ProductGrid({
  addToCartLabel,
  initialCategory,
  initialSearch = "",
  collection,
}: ProductGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  // The two ends of the price slider; null until they have loaded.
  const [priceBounds, setPriceBounds] = useState<{
    min: number;
    max: number;
  } | null>(null);
  // The categories opened up in the sidebar to show what is under them.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () =>
      new Set(
        [initialCategory?.parentId, initialCategory?.id].filter(
          (id): id is string => Boolean(id),
        ),
      ),
  );

  const initialFilters: Filters = {
    categoryId: initialCategory?.id ?? null,
    collection: collection ?? null,
    brandId: null,
    minPrice: null,
    maxPrice: null,
    search: initialSearch,
    sort: "default",
  };
  const [filters, setFilters] = useState<Filters>(initialFilters);
  // The same filters, readable at once by handlers that run before the next
  // render (a state update isn't visible until then).
  const filtersRef = useRef<Filters>(initialFilters);
  const [query, setQuery] = useState(initialSearch);

  const [products, setProducts] = useState<CatalogCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [categoriesRes, brandsRes, priceRange] = await Promise.all([
        listCategoriesAction(),
        listBrandsAction(),
        getProductPriceRangeAction(),
      ]);
      if (!mounted) return;
      // Still usable if the range can't be fetched.
      setPriceBounds(priceRange ?? { min: 0, max: 10000 });
      setCategories(
        categoriesRes.ok && categoriesRes.data ? categoriesRes.data : [],
      );
      setCategoriesLoading(false);
      setBrands(
        (brandsRes.ok && brandsRes.data ? brandsRes.data : [])
          .filter((brand) => brand.isActive)
          .sort((a, b) =>
            a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
          ),
      );
      setBrandsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category._id, category])),
    [categories],
  );
  const topCategories = useMemo(
    () => categories.filter((category) => !category.parent),
    [categories],
  );
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const category of categories) {
      if (!category.parent) continue;
      const parentId = String(category.parent);
      const siblings = map.get(parentId) ?? [];
      siblings.push(category);
      map.set(parentId, siblings);
    }
    return map;
  }, [categories]);

  // Counts product requests so a slow answer to an older search or sort can't
  // overwrite the results of a newer one.
  const latestRequest = useRef(0);

  const loadProducts = useCallback(async (next: Filters) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    const res = await listCatalogProductsAction(toParams(next, 1));
    if (requestId !== latestRequest.current) return;

    if (res.ok && res.data?.products) {
      setProducts(
        res.data.products.map((product, index) =>
          toCatalogCardProduct(product, index),
        ),
      );
      setTotalPages(res.data.totalPages);
    } else {
      setProducts([]);
      setTotalPages(1);
    }
    setPage(1);
    setLoading(false);
  }, []);

  // Changes some of the filters and reloads the products with the result.
  const applyFilters = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filtersRef.current, ...patch };
      filtersRef.current = next;
      setFilters(next);
      void loadProducts(next);
    },
    [loadProducts],
  );

  // First render: every product, or just the category / collection / search
  // the page opened on.
  useEffect(() => {
    void loadProducts(filtersRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A category and a collection are two answers to the same question —
  // "which products?" — so picking one lets go of the other. The price range
  // and the brand narrow whichever is chosen.
  const pickCategory = (category: Category) => {
    const wasActive = filtersRef.current.categoryId === category._id;
    setExpandedIds((current) => {
      const next = new Set(current);
      // A second click on the chosen category folds it back up.
      if (wasActive && next.has(category._id)) next.delete(category._id);
      else next.add(category._id);
      return next;
    });
    setQuery("");
    applyFilters({ categoryId: category._id, collection: null, search: "" });
  };

  const pickCollection = (key: ProductCollection) => {
    setQuery("");
    applyFilters({ categoryId: null, collection: key, search: "" });
  };

  const pickAll = () => {
    setQuery("");
    applyFilters({ categoryId: null, collection: null, search: "" });
  };

  // Runs the search box's text against every category. An empty box goes back
  // to the full product list.
  const applySearch = useCallback(
    (value: string) => {
      applyFilters({ categoryId: null, collection: null, search: value });
    },
    [applyFilters],
  );

  // Enter / the search button: search straight away.
  const handleSearchSubmit = () => {
    const trimmed = query.trim();
    if (trimmed === filters.search) return;
    applySearch(trimmed);
  };

  // Search as you type: once the visitor pauses, run whatever is in the box.
  // Clearing the box restores the full list at once; a single letter matches
  // far too much to be useful, so that waits for Enter or another keystroke.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === filters.search || trimmed.length === 1) return;

    const timer = setTimeout(
      () => applySearch(trimmed),
      trimmed ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [query, filters.search, applySearch]);

  // The navbar search opens /product?q=…, and the page restarts this grid
  // whenever that `q` changes. Repeating the search the page already opened on
  // leaves the URL untouched, so that one case is picked up here instead —
  // e.g. after the visitor has since browsed to a category on this page.
  useEffect(() => {
    const onNavbarSearch = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (value !== initialSearch) return;
      setQuery(value);
      applySearch(value);
    };

    window.addEventListener(PRODUCT_SEARCH_EVENT, onNavbarSearch);
    return () =>
      window.removeEventListener(PRODUCT_SEARCH_EVENT, onNavbarSearch);
  }, [initialSearch, applySearch]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const requestId = latestRequest.current;
    const nextPage = page + 1;
    const res = await listCatalogProductsAction(
      toParams(filtersRef.current, nextPage),
    );

    // The list was replaced by a new search or sort while this was loading.
    if (requestId !== latestRequest.current) {
      setLoadingMore(false);
      return;
    }

    if (res.ok && res.data?.products) {
      setProducts((prev) => [
        ...prev,
        ...res.data!.products.map((product, index) =>
          toCatalogCardProduct(product, prev.length + index),
        ),
      ]);
      setTotalPages(res.data.totalPages);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const hasMore = page < totalPages;
  const activeCategoryId = filters.categoryId;
  const showingEverything =
    activeCategoryId === null && filters.collection === null;
  const activeBrand = brands.find((brand) => brand._id === filters.brandId);
  const priceActive = filters.minPrice !== null || filters.maxPrice !== null;
  // The slider starts over whenever its ends load or the range is changed
  // from outside it (the "×" on the price chip), so its handles follow.
  const priceSliderKey = `${priceBounds?.min}-${priceBounds?.max}-${filters.minPrice}-${filters.maxPrice}`;

  // ── Phone / tablet category slider ────────────────────────────────────────
  // Below `lg` the sidebar is replaced by a row of chips that scrolls sideways.
  const stripRef = useRef<HTMLDivElement>(null);

  // Slides a chip to the middle of its row. Done by hand (not scrollIntoView)
  // so only the row moves — the page itself never jumps.
  const centerChip = (chip: HTMLElement) => {
    const row = chip.parentElement;
    if (!row) return;
    row.scrollTo({
      left: chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2,
      behavior: "smooth",
    });
  };

  // The chosen category's line of parents, top one first — e.g. Makeup,
  // Lip Makeup, Lipstick.
  const activePath = useMemo(() => {
    const path: Category[] = [];
    let current = activeCategoryId
      ? categoryById.get(activeCategoryId)
      : undefined;
    // The length check guards against a parent loop in the data.
    while (current && path.length < 20) {
      path.unshift(current);
      current = current.parent
        ? categoryById.get(String(current.parent))
        : undefined;
    }
    return path;
  }, [activeCategoryId, categoryById]);
  const currentTopCategory = activePath[0] ?? null;

  // A category page can open on a chip that is off-screen — bring it into view
  // once the categories have loaded.
  useEffect(() => {
    if (categoriesLoading) return;
    const active = stripRef.current?.querySelector<HTMLElement>(
      '[data-current="true"]',
    );
    if (active) centerChip(active);
  }, [categoriesLoading]);

  const chipClass = (current: boolean) =>
    `inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
      current
        ? "border-(--color-primary) bg-(--color-primary) text-white"
        : "border-(--color-border) bg-(--color-surface) text-(--color-dark)"
    }`;
  const subChipClass = (current: boolean) =>
    `inline-flex shrink-0 snap-start items-center rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
      current
        ? "border-(--color-primary) bg-(--color-primary-faint) text-(--color-primary)"
        : "border-(--color-border) bg-(--color-bg) text-(--color-text-muted)"
    }`;
  // A sideways-scrolling row that runs to the screen edges (cancelling the
  // page container's padding) with the scrollbar hidden.
  const chipRowClass =
    "-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden";

  // One category in the sidebar with everything nested under it. Each level
  // sits a step further in.
  const renderBranch = (category: Category, depth: number) => {
    const children = childrenByParent.get(category._id) ?? [];
    const isActive = activeCategoryId === category._id;
    const isExpanded = expandedIds.has(category._id);
    const Icon = depth === 0 ? getCategoryIcon(category) : null;

    return (
      <div key={category._id}>
        <button
          type="button"
          onClick={() => pickCategory(category)}
          style={
            depth > 0 ? { paddingInlineStart: 26 + depth * 14 } : undefined
          }
          className={
            depth === 0
              ? sideItemClass(isActive)
              : `flex w-full items-center justify-start gap-2 rounded-(--radius-md) py-1.5 pe-2 text-start text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-(--color-primary)"
                    : "font-normal text-(--color-text-muted) hover:bg-(--color-bg) hover:text-(--color-dark)"
                }`
          }
        >
          {Icon && <Icon size={17} className="w-5 shrink-0" />}
          <span className="min-w-0 flex-1 truncate">{category.name}</span>
          {children.length > 0 && (
            <ChevronDown
              size={14}
              className={`shrink-0 text-(--color-text-light) transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {isExpanded && children.length > 0 && (
          <div className="mt-0.5 mb-1 flex flex-col gap-0.5">
            {children.map((child) => renderBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_8fr]">
      {/* Phones and tablets: collections and categories as a sideways-
          scrolling row of chips, with price and brand tucked under "Filters". */}
      <nav aria-label="Categories" className="min-w-0 lg:hidden">
        <div ref={stripRef} className={chipRowClass}>
          {categoriesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <span
                key={`chip-skeleton-${i}`}
                className="h-[38px] w-28 shrink-0 animate-pulse rounded-full bg-(--color-border)"
              />
            ))
          ) : (
            <>
              <button
                type="button"
                data-current={showingEverything}
                aria-pressed={showingEverything}
                onClick={(event) => {
                  pickAll();
                  centerChip(event.currentTarget);
                }}
                className={chipClass(showingEverything)}
              >
                <Package size={16} className="shrink-0" />
                All Categories
              </button>

              {COLLECTIONS.map(({ key, label, icon: Icon }) => {
                const current = filters.collection === key;
                return (
                  <button
                    key={key}
                    type="button"
                    data-current={current}
                    aria-pressed={current}
                    onClick={(event) => {
                      pickCollection(key);
                      centerChip(event.currentTarget);
                    }}
                    className={chipClass(current)}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                  </button>
                );
              })}

              {topCategories.map((category) => {
                const Icon = getCategoryIcon(category);
                const current = currentTopCategory?._id === category._id;

                return (
                  <button
                    key={category._id}
                    type="button"
                    data-current={current}
                    aria-pressed={current}
                    onClick={(event) => {
                      pickCategory(category);
                      centerChip(event.currentTarget);
                    }}
                    className={chipClass(current)}
                  >
                    <Icon size={16} className="shrink-0" />
                    {category.name}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* One more row for each level of the chosen category: what is under
            Makeup, then what is under the Lip Makeup picked from that. */}
        {activePath.map((ancestor) => {
          const children = childrenByParent.get(ancestor._id) ?? [];
          if (children.length === 0) return null;

          return (
            <div key={ancestor._id} className={`${chipRowClass} mt-2.5`}>
              {children.map((child) => {
                const current = activePath.some(
                  (step) => step._id === child._id,
                );
                return (
                  <button
                    key={child._id}
                    type="button"
                    aria-pressed={current}
                    onClick={(event) => {
                      pickCategory(child);
                      centerChip(event.currentTarget);
                    }}
                    className={subChipClass(current)}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          );
        })}

        <details className="mt-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-(--color-dark) [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal size={16} className="shrink-0" />
            Price &amp; Brand
            {(priceActive || activeBrand) && (
              <span className="rounded-full bg-(--color-primary) px-2 py-0.5 text-[11px] font-semibold text-white">
                {Number(priceActive) + Number(Boolean(activeBrand))}
              </span>
            )}
            <ChevronDown
              size={16}
              className="ms-auto shrink-0 text-(--color-text-light)"
            />
          </summary>
          <div className="flex flex-col gap-4 border-t border-(--color-border) p-4">
            <div>
              <p className="mb-2 text-sm font-bold text-(--color-dark)">
                Price Range
              </p>
              <PriceFilter
                key={priceSliderKey}
                bounds={priceBounds}
                min={filters.minPrice}
                max={filters.maxPrice}
                onApply={(minPrice, maxPrice) =>
                  applyFilters({ minPrice, maxPrice })
                }
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-(--color-dark)">
                Brands
              </p>
              <BrandFilter
                brands={brands}
                loading={brandsLoading}
                activeId={filters.brandId}
                onPick={(brandId) => applyFilters({ brandId })}
              />
            </div>
          </div>
        </details>
      </nav>

      {/* Desktop: the sidebar on the left — price range first, then the
          categories, then the brands. */}
      <aside className="hidden lg:flex lg:flex-col lg:gap-4">
        <div className={cardClass}>
          <h3 className="mb-3 px-1 text-base font-bold text-(--color-dark)">
            Price Range
          </h3>
          <PriceFilter
            key={priceSliderKey}
            bounds={priceBounds}
            min={filters.minPrice}
            max={filters.maxPrice}
            onApply={(minPrice, maxPrice) =>
              applyFilters({ minPrice, maxPrice })
            }
          />
        </div>

        <div className={cardClass}>
          <h3 className="px-1 text-base font-bold text-(--color-dark)">
            Categories
          </h3>
          <div className="mt-3 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={pickAll}
              className={sideItemClass(showingEverything)}
            >
              <Package size={17} className="w-5 shrink-0" />
              <span className="flex-1 truncate">All Categories</span>
            </button>

            {COLLECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => pickCollection(key)}
                className={sideItemClass(filters.collection === key)}
              >
                <Icon size={17} className="w-5 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
              </button>
            ))}

            <div className="my-1.5 border-t border-(--color-border)" />

            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`category-skeleton-${i}`}
                  className="h-9 w-full animate-pulse rounded-(--radius-md) bg-(--color-border)"
                />
              ))
            ) : (
              <>
                {topCategories.map((category) => renderBranch(category, 0))}

                {topCategories.length === 0 && (
                  <p className="px-1 py-4 text-sm text-(--color-text-muted)">
                    No categories yet.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="mb-3 px-1 text-base font-bold text-(--color-dark)">
            Brands
          </h3>
          <BrandFilter
            brands={brands}
            loading={brandsLoading}
            activeId={filters.brandId}
            onPick={(brandId) => applyFilters({ brandId })}
          />
        </div>
      </aside>

      {/* Search + results — right side */}
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            aria-label="Sort by"
            value={filters.sort}
            onChange={(e) => applyFilters({ sort: e.target.value as SortValue })}
            className="!w-auto shrink-0 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="flex h-[46px] items-stretch overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg) shadow-(--shadow-sm) transition-all focus-within:border-(--color-primary) focus-within:bg-(--color-surface) focus-within:shadow-[0_0_0_3px_var(--color-primary-faint)] sm:w-72"
          >
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full min-w-0 border-0 bg-transparent px-4 text-sm shadow-none outline-none placeholder:text-(--color-text-light)"
            />
            <button
              type="submit"
              aria-label="Search"
              className="btn-primary me-1.5 shrink-0 self-center rounded-full px-4"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* The price range and brand in force, each removable with one tap. */}
        {(priceActive || activeBrand) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {priceActive && (
              <button
                type="button"
                onClick={() => applyFilters({ minPrice: null, maxPrice: null })}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-dark) hover:border-(--color-primary)"
              >
৳ {(filters.minPrice ?? priceBounds?.min ?? 0).toLocaleString("en")}{" "}
                – ৳{" "}
                {(filters.maxPrice ?? priceBounds?.max ?? 0).toLocaleString("en")}
                <X size={13} className="shrink-0" />
              </button>
            )}
            {activeBrand && (
              <button
                type="button"
                onClick={() => applyFilters({ brandId: null })}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-dark) hover:border-(--color-primary)"
              >
                {activeBrand.name}
                <X size={13} className="shrink-0" />
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-(--radius-lg) border border-(--color-border)"
              >
                <div className="aspect-square animate-pulse bg-(--color-border)" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-full animate-pulse rounded bg-(--color-border)" />
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-(--color-border)" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-(--color-border)" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-(--radius-lg) border border-dashed border-(--color-border) py-16 text-center">
            <p className="text-(--color-text-muted)">No products found.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => {
              const Icon = CATALOG_CARD_ICONS[i % CATALOG_CARD_ICONS.length];

              return (
                <FadeIn
                  key={product.id}
                  delay={Math.min(i, 4) * 0.05}
                  // Full height of the grid cell, so the card inside can fill it.
                  className="h-full"
                >
                  <ProductCard
                    addToCartLabel={addToCartLabel}
                    product={product}
                    icon={
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.25}
                        size={64}
                        className="absolute inset-0 m-auto text-white/90 transition-transform duration-300 group-hover:scale-110"
                      />
                    }
                  />
                </FadeIn>
              );
            })}
          </div>
        )}

        {!loading && products.length > 0 && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-outline inline-flex items-center gap-2 disabled:opacity-60"
            >
              {loadingMore && <Loader2 size={16} className="animate-spin" />}
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGrid;
