"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck, Zap } from "lucide-react";
import { colorSwatches, type Product } from "@/app/data/products";
import { cartLineKey, useCart } from "@/component/providers/CartProvider";
import { useProductSelection } from "@/component/product/ProductSelection";
import { ProductShare } from "@/component/product/ProductShare";
import { formatPrice } from "@/app/utils/format-price";
import { useWishlist } from "@/component/providers/WishlistProvider";

interface ProductDetailInfoProps {
  product: Omit<Product, "icon">;
  shortDescription?: string;
  weight?: number;
  unit?: string;
  addToCartLabel: string;
  buyNowLabel: string;
}

export function ProductDetailInfo({
  product,
  shortDescription,
  weight,
  unit,
  addToCartLabel,
  buyNowLabel,
}: ProductDetailInfoProps) {
  const { addItem, updateQty, items } = useCart();
  const router = useRouter();
  const { isWishlisted, toggleItem } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  // Color / size chosen on this page (null for a product without options).
  const selection = useProductSelection();
  const [choiceError, setChoiceError] = useState("");

  const color = selection?.color ?? null;
  const size = selection?.size ?? "";
  const hasColors = selection?.hasColors ?? false;
  // A size is needed when the chosen color (or a colorless product) has any.
  const needsSize = (selection?.availableSizes.length ?? 0) > 0;
  // Every size the product has is listed (ones the chosen color doesn't come
  // in are shown disabled) — unless the chosen color has no sizes at all.
  const sizeOptions =
    !selection || (color && color.sizes.length === 0)
      ? []
      : selection.options.sizes;

  // The chosen size can make the item dearer or cheaper; the same difference
  // applies to the regular (struck-through) price.
  const adjustment = selection?.sizeAdjustment ?? 0;
  const price = product.price + adjustment;
  const originalPrice = product.originalPrice
    ? product.originalPrice + adjustment
    : undefined;

  // Until a size is picked, show the span of prices the sizes cover.
  const priceRange = (() => {
    if (!selection || !needsSize || size) return null;
    const prices = selection.availableSizes.map(
      (option) => product.price + selection.adjustmentFor(option),
    );
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    return low === high ? null : { low, high };
  })();

  // What goes in the cart: this exact variation, at its own price and with
  // the color's photo when it has one.
  const cartProduct = {
    ...product,
    price,
    originalPrice,
    color: color?.name,
    colorHex: color?.hex,
    size: size || undefined,
    image: color?.images[0] || product.image,
  };

  // Returns false (and says why) while a required choice is missing.
  const choiceComplete = () => {
    const missing =
      hasColors && !color ? "color" : needsSize && !size ? "size" : null;
    setChoiceError(missing ? `Please choose a ${missing} first.` : "");
    return !missing;
  };

  const handleAddToCart = () => {
    if (!choiceComplete()) return;
    addItem(cartProduct, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Buy Now puts exactly the chosen quantity in the cart (without stacking on
  // top of an earlier add) and goes straight to checkout, signed in or not.
  const handleBuyNow = () => {
    if (!choiceComplete()) return;
    const lineKey = cartLineKey(cartProduct);
    if (items.some((item) => cartLineKey(item) === lineKey)) {
      updateQty(lineKey, quantity);
    } else {
      addItem(cartProduct, quantity);
    }
    router.push("/checkout");
  };

  const discountPercent = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  return (
    <div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {priceRange ? (
          <span className="price text-3xl">
            {formatPrice(priceRange.low)} – {formatPrice(priceRange.high)}
          </span>
        ) : (
          <span className="price text-3xl">{formatPrice(price)}</span>
        )}
        {!priceRange && originalPrice && (
          <>
            <span className="price-original">{formatPrice(originalPrice)}</span>
            <span className="price-discount">-{discountPercent}%</span>
          </>
        )}
      </div>
      {priceRange && (
        <p className="mt-0.5 text-xs text-(--color-text-muted)">
          Price depends on the size you choose.
        </p>
      )}

      {shortDescription && (
        <div className="mt-2 text-sm leading-snug whitespace-pre-line text-(--color-text-muted)">
          {shortDescription}
        </div>
      )}

      {(product.color || product.size || (weight !== undefined && unit)) && (
        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          {product.color && (
            <span className="inline-flex items-center gap-2 text-(--color-text-muted)">
              Color:
              <span className="inline-flex items-center gap-1.5 font-medium text-(--color-dark)">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-(--color-border)"
                  style={{ background: colorSwatches[product.color] ?? "transparent" }}
                />
                {product.color}
              </span>
            </span>
          )}
          {product.size && (
            <span className="text-(--color-text-muted)">
              Size: <span className="font-medium text-(--color-dark)">{product.size}</span>
            </span>
          )}
          {weight !== undefined && unit && (
            <span className="text-(--color-text-muted)">
              Weight/Volume:{" "}
              <span className="font-medium text-(--color-dark)">
                {weight} {unit}
              </span>
            </span>
          )}
        </div>
      )}

      {selection && hasColors && (
        <div className="mt-5">
          <p className="text-sm text-(--color-text-muted)">
            Color:{" "}
            <span className="font-semibold text-(--color-dark)">
              {color?.name ?? "Choose a color"}
            </span>
          </p>
          <div
            role="radiogroup"
            aria-label="Color"
            className="mt-2 flex flex-wrap gap-2.5"
          >
            {selection.options.colors.map((option) => {
              const selected = option.name === color?.name;
              return (
                <button
                  key={option.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => {
                    selection.selectColor(option.name);
                    setChoiceError("");
                  }}
                  className={`h-10 w-10 shrink-0 rounded-full p-1 transition-shadow ${
                    selected
                      ? "ring-2 ring-(--color-primary) ring-offset-2 ring-offset-(--color-bg)"
                      : "ring-1 ring-(--color-border) hover:ring-(--color-text-light)"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="block h-full w-full rounded-full border border-black/10"
                    style={{ background: option.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selection && sizeOptions.length > 0 && (
        <div className="mt-5">
          <p className="text-sm text-(--color-text-muted)">
            Size:{" "}
            <span className="font-semibold text-(--color-dark)">
              {size || "Choose a size"}
            </span>
          </p>
          <div
            role="radiogroup"
            aria-label="Size"
            className="mt-2 flex flex-wrap gap-2"
          >
            {sizeOptions.map((option) => {
              const selected = option === size;
              // With a color chosen, sizes it doesn't come in are shown but
              // can't be picked.
              const available = !color || color.sizes.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!available}
                  title={available ? undefined : `Not available in ${color?.name}`}
                  onClick={() => {
                    selection.selectSize(option);
                    setChoiceError("");
                  }}
                  className={`h-10 min-w-11 rounded-(--radius-md) border px-3 py-0 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-(--color-primary) bg-(--color-primary) text-white"
                      : available
                        ? "border-(--color-border) bg-(--color-surface) text-(--color-dark) hover:border-(--color-primary)"
                        : "border-dashed border-(--color-border) bg-transparent text-(--color-text-light) line-through"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {choiceError && (
        <p
          role="alert"
          className="mt-4 rounded-(--radius-md) bg-red-50 px-3 py-2 text-sm font-medium text-(--color-error)"
        >
          {choiceError}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <div className="inline-flex w-fit items-center gap-1 rounded-(--radius-md) border border-(--color-border) py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium text-(--color-dark)">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => toggleItem(product)}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-md) border p-0 transition-colors ${
            wishlisted
              ? "border-(--color-primary) bg-(--color-primary-faint) text-(--color-primary)"
              : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary)"
          }`}
        >
          <Heart size={16} className={wishlisted ? "fill-current" : ""} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn-outline inline-flex flex-1 items-center justify-center gap-2"
        >
          {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
          {justAdded ? "Added" : addToCartLabel}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="btn-primary inline-flex flex-1 items-center justify-center gap-2"
        >
          <Zap size={16} />
          {buyNowLabel}
        </button>
      </div>

      <ProductShare title={product.name} />

      <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-(--color-border) pt-5 sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-muted)">
          <Truck size={14} className="text-(--color-primary)" />
          Worldwide Shipping
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-muted)">
          <ShieldCheck size={14} className="text-(--color-primary)" />
          Buyer Protection
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-(--color-text-muted)">
          <RotateCcw size={14} className="text-(--color-primary)" />
          Easy Returns
        </span>
      </div>
    </div>
  );
}

export default ProductDetailInfo;
