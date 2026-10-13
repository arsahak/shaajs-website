"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { colorSwatches, type Product } from "@/app/data/products";
import { cartLineKey, useCart } from "@/component/providers/CartProvider";
import { useProductSelection } from "@/component/product/ProductSelection";
import { descriptionContentClass } from "@/app/utils/description-styles";
import { formatPrice } from "@/app/utils/format-price";
import { useWishlist } from "@/component/providers/WishlistProvider";

// A small outlined tag for one fact about the product: an icon, what it is,
// and its value. No fill — it sits on the page's own background.
const factClass =
  "inline-flex items-center gap-1.5 rounded-(--radius-pill) border border-(--color-border) px-3 py-1 text-sm";
const factIconClass = "flex items-center text-(--color-primary)";

// How much is in the pack: "Weight 200 g", "Weight 100 ml" — the shop calls
// both weight — and "Quantity 2 pcs" for things sold by the piece.
const MEASURES: Record<string, { label: string; Icon: LucideIcon }> = {
  g: { label: "Weight", Icon: Weight },
  kg: { label: "Weight", Icon: Weight },
  ml: { label: "Weight", Icon: Weight },
  l: { label: "Weight", Icon: Weight },
  pcs: { label: "Quantity", Icon: Package },
};

const describeMeasure = (weight?: number, unit?: string) => {
  if (weight === undefined || !unit) return null;
  const measure = MEASURES[unit] ?? { label: "Weight", Icon: Weight };
  return {
    ...measure,
    // One piece is "1 pc", not "1 pcs".
    value: unit === "pcs" && weight === 1 ? "1 pc" : `${weight} ${unit}`,
  };
};

interface ProductDetailInfoProps {
  product: Omit<Product, "icon">;
  /** The short description as HTML, already cleaned of anything but text. */
  shortDescriptionHtml?: string;
  weight?: number;
  unit?: string;
  addToCartLabel: string;
  buyNowLabel: string;
}

export function ProductDetailInfo({
  product,
  shortDescriptionHtml,
  weight,
  unit,
  addToCartLabel,
  buyNowLabel,
}: ProductDetailInfoProps) {
  const measure = describeMeasure(weight, unit);
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
          <span className="price text-3xl text-(--color-primary-dark)">
            {formatPrice(priceRange.low)} – {formatPrice(priceRange.high)}
          </span>
        ) : (
          <span className="price text-3xl text-(--color-primary-dark)">{formatPrice(price)}</span>
        )}
        {!priceRange && originalPrice && (
          <>
            <span className="price-original">{formatPrice(originalPrice)}</span>
            {/* What the discount is worth in taka, with the percentage as a
                small note beside it. */}
            <span className="inline-flex items-baseline gap-1.5 rounded-full bg-(--color-primary-faint) px-2.5 py-1 text-sm font-semibold text-(--color-primary)">
              Save {formatPrice(originalPrice - price)}
              <span className="text-xs font-medium opacity-75">
                ({discountPercent}% off)
              </span>
            </span>
          </>
        )}
      </div>
      {priceRange && (
        <p className="mt-0.5 text-xs text-(--color-text-muted)">
          Price depends on the size you choose.
        </p>
      )}

      {shortDescriptionHtml && (
        // Set by the same rules the dashboard's editor shows it with.
        <div
          className={`mt-3 ${descriptionContentClass("summary")}`}
          dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
        />
      )}

      {(product.color || product.size || measure) && (
        // The product's fixed facts, each as its own small tag.
        <div className="mt-4 flex flex-wrap gap-2">
          {measure && (
            <span className={factClass}>
              <span className={factIconClass}>
                <measure.Icon size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-(--color-text-muted)">{measure.label}:</span>
              <span className="font-semibold text-(--color-dark)">
                {measure.value}
              </span>
            </span>
          )}
          {product.color && (
            <span className={factClass}>
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border border-(--color-border)"
                style={{ background: colorSwatches[product.color] ?? "transparent" }}
              />
              <span className="text-(--color-text-muted)">Color:</span>
              <span className="font-semibold text-(--color-dark)">
                {product.color}
              </span>
            </span>
          )}
          {product.size && (
            <span className={factClass}>
              <span className={factIconClass}>
                <Ruler size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-(--color-text-muted)">Size:</span>
              <span className="font-semibold text-(--color-dark)">
                {product.size}
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

      {/* On a phone the quantity stepper and the wishlist button share the
          row half and half, the wishlist button with its name beside the
          heart; from tablets up both are their own compact size and the
          wishlist button is the heart alone. */}
      <div className="mt-5 grid grid-cols-2 items-center gap-3 sm:flex">
        <div className="flex h-11 items-center justify-between gap-1 rounded-(--radius-md) border border-(--color-border) sm:inline-flex sm:h-auto sm:w-fit sm:flex-none sm:justify-start sm:py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-full px-5 py-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-primary) sm:h-auto sm:px-3"
          >
            <Minus size={14} />
          </button>
          <span className="flex-1 text-center text-sm font-medium text-(--color-dark) sm:w-8 sm:flex-none">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-full px-5 py-1.5 text-(--color-text-muted) transition-colors hover:text-(--color-primary) sm:h-auto sm:px-3"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => toggleItem(product)}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-(--radius-md) border px-3 text-sm font-medium transition-colors sm:h-9 sm:w-9 sm:shrink-0 sm:p-0 ${
            wishlisted
              ? "border-(--color-primary) bg-(--color-primary-faint) text-(--color-primary)"
              : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary)"
          }`}
        >
          <Heart size={16} className={wishlisted ? "fill-current" : ""} />
          <span className="sm:hidden">
            {wishlisted ? "Wishlisted" : "Wishlist"}
          </span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          // Both buttons are given the same height outright: stacked on a
          // phone, each would otherwise take the height of its own style.
          // (They only share the row's width — flex-1 — once side by side;
          // stacked, that would let their content set the height again.)
          className="btn-outline inline-flex h-11 shrink-0 items-center justify-center gap-2 sm:h-auto sm:min-h-11 sm:flex-1"
        >
          {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
          {justAdded ? "Added" : addToCartLabel}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="btn-primary inline-flex h-11 shrink-0 items-center justify-center gap-2 sm:h-auto sm:min-h-11 sm:flex-1"
        >
          <Zap size={16} />
          {buyNowLabel}
        </button>
      </div>

      {/* What the shopper can count on — three short promises, each with an
          icon in a soft round badge. */}
      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-(--color-border) pt-5 sm:grid-cols-3">
        {[
          {
            icon: Truck,
            title: "Delivery All Over Bangladesh",
            note: "To every district",
          },
          {
            icon: ShieldCheck,
            title: "100% Secure Payment",
            note: "Pay safely, cash on delivery",
          },
          {
            icon: RotateCcw,
            title: "3-Day Easy Return",
            note: "Hassle-free returns",
          },
        ].map(({ icon: Icon, title, note }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
              <Icon aria-hidden="true" size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-snug font-semibold text-(--color-dark)">
                {title}
              </span>
              <span className="block text-xs text-(--color-text-muted)">
                {note}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetailInfo;
