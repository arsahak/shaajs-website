"use client";

import type { ProductColor, ProductSizePrice } from "@/app/actions/products";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** A product's variations, as the catalog API returns them. */
export interface ProductOptions {
  sizes: string[];
  colors: ProductColor[];
  sizePrices: ProductSizePrice[];
}

interface ProductSelectionValue {
  options: ProductOptions;
  hasColors: boolean;
  /** Any size is on offer at all (for this product, in any color). */
  hasSizes: boolean;
  /** The chosen color, or null while none is chosen / the product has none. */
  color: ProductColor | null;
  /** The chosen size, or "" while none is chosen / none applies. */
  size: string;
  /** Sizes the shopper can pick right now (narrowed by the chosen color). */
  availableSizes: string[];
  /** How much the chosen size adds to (or takes off) the base price. */
  sizeAdjustment: number;
  /** Every size's adjustment, for showing a price range before one is picked. */
  adjustmentFor: (size: string) => number;
  selectColor: (name: string) => void;
  selectSize: (size: string) => void;
}

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const ProductSelectionContext = createContext<ProductSelectionValue | null>(
  null,
);

// A lone option needs no choosing — start with it selected.
const onlyOne = <T,>(list: T[]): T | null => (list.length === 1 ? list[0] : null);

/**
 * Holds which color and size the shopper has picked on a product page, so the
 * gallery (shows the color's photo) and the buy box (price, add to cart) stay
 * in step.
 */
export function ProductSelectionProvider({
  options,
  children,
}: {
  options: ProductOptions;
  children: ReactNode;
}) {
  const { sizes, colors, sizePrices } = options;

  const [colorName, setColorName] = useState<string>(
    () => onlyOne(colors)?.name ?? "",
  );
  const [size, setSize] = useState<string>(() => {
    const startColor = onlyOne(colors);
    const startSizes = startColor
      ? startColor.sizes
      : colors.length > 0
        ? []
        : sizes;
    return onlyOne(startSizes) ?? "";
  });

  const color = useMemo(
    () => colors.find((option) => option.name === colorName) ?? null,
    [colors, colorName],
  );

  // With colors, sizes belong to the chosen color; until one is chosen, show
  // every size the product has so the shopper can see what exists.
  const availableSizes = color ? color.sizes : sizes;

  const adjustmentFor = useCallback(
    (target: string) =>
      sizePrices.find((entry) => sameText(entry.size, target))?.adjustment ?? 0,
    [sizePrices],
  );

  const selectColor = useCallback(
    (name: string) => {
      const next = colors.find((option) => option.name === name);
      if (!next) return;
      setColorName(next.name);
      // Keep the size if the new color has it; otherwise fall back to its
      // only size, or ask again.
      setSize((current) =>
        next.sizes.some((option) => sameText(option, current))
          ? current
          : (onlyOne(next.sizes) ?? ""),
      );
    },
    [colors],
  );

  const selectSize = useCallback((next: string) => setSize(next), []);

  const value = useMemo<ProductSelectionValue>(
    () => ({
      options,
      hasColors: colors.length > 0,
      hasSizes: sizes.length > 0,
      color,
      size,
      availableSizes,
      sizeAdjustment: size ? adjustmentFor(size) : 0,
      adjustmentFor,
      selectColor,
      selectSize,
    }),
    [
      options,
      colors.length,
      sizes.length,
      color,
      size,
      availableSizes,
      adjustmentFor,
      selectColor,
      selectSize,
    ],
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

/** The product page's color/size selection, or null outside a product page. */
export function useProductSelection() {
  return useContext(ProductSelectionContext);
}
