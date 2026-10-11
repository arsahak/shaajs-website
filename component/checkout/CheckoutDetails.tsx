"use client";

import type { Dictionary } from "@/app/dictionaries";
import { DELIVERY_ZONES, type DeliveryZone } from "@/app/data/checkout";
import { cartLineKey, useCart } from "@/component/providers/CartProvider";
import { formatPrice } from "@/app/utils/format-price";
import { PhoneInput } from "@/component/common/PhoneInput";
import {
  AlertCircle,
  Banknote,
  Check,
  Loader2,
  TicketPercent,
  X,
  LockKeyhole,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  placeOrderAction,
  validateCouponAction,
  verifyAndPlaceOrderAction,
  type Order,
  type PlaceOrderInput,
} from "@/app/actions/order";
import { requestSigninOtpAction } from "@/app/actions/auth";
import { OrderVerifyDialog } from "@/component/checkout/OrderVerifyDialog";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { OrderSuccessModal } from "./OrderSuccessModal";

interface CheckoutDetailsProps {
  dict: Dictionary;
  /**
   * False for a visitor with no account yet — they're verified by a one-time
   * code when they place the order, which creates it.
   */
  isSignedIn: boolean;
  initialUser?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    /** Saved from an earlier order, so a returning customer needn't retype it. */
    address?: string | null;
    zone?: string | null;
  };
}

// Mirrors backend createOrder: 80 inside Dhaka, 150 everywhere else. The
// backend's figure is what's actually charged.
function deliveryFeeFor(zone: DeliveryZone): number {
  return zone === "Inside Dhaka" ? 80 : 150;
}

// The ways to pay, as small cards. Only cash on delivery works for now; the
// mobile wallets are shown so customers know they're coming. Logos are the
// same files the footer uses (/public/assets/payments).
const PAYMENT_OPTIONS = [
  { id: "cod", logos: [], available: true },
  {
    id: "bkash",
    label: "bKash",
    logos: ["/assets/payments/bkash.png"],
    available: false,
  },
  {
    id: "nagad",
    label: "Nagad",
    logos: ["/assets/payments/nagad.png"],
    available: false,
  },
  {
    id: "rocket",
    label: "Rocket",
    logos: ["/assets/payments/rocket.png"],
    available: false,
  },
  {
    id: "card",
    logos: ["/assets/payments/visa.svg", "/assets/payments/mastercard.svg"],
    available: false,
  },
] as const;

type PaymentOptionId = (typeof PAYMENT_OPTIONS)[number]["id"];

// The small white tile each payment logo sits on — same as in the footer.
const logoTileClass =
  "flex h-8 w-[50px] items-center justify-center overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white";

type ContactMethod = "phone" | "email";

// An order waiting on the customer confirming the code sent to their contact.
interface PendingVerification {
  /** The contact as the backend normalized it — what the code is tied to. */
  identifier: string;
  /** The same contact, as shown back to the customer. */
  sentTo: string;
  channel: ContactMethod;
  sentAt: number;
  order: PlaceOrderInput;
}

// A code stays good for ten minutes; one sent less than this long ago is
// reused when the customer comes back to the same contact.
const CODE_REUSE_MS = 9 * 60_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Marks the fields the order can't be placed without.
function Required() {
  return (
    <span aria-hidden="true" className="ms-0.5 text-(--color-error)">
      *
    </span>
  );
}

// 16px on phones: iOS Safari zooms the page when a focused field is smaller.
const inputClass =
  "h-12 rounded-lg px-4 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm";

// A small round check with its label — the form's only kind of choice.
function RadioOption({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="mb-0 flex cursor-pointer items-center gap-2 text-sm font-medium text-(--color-dark)">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          checked
            ? "border-(--color-primary) bg-(--color-primary)"
            : "border-(--color-border)"
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      </span>
      {children}
    </label>
  );
}

const CheckoutDetails = ({
  dict,
  isSignedIn,
  initialUser,
}: CheckoutDetailsProps) => {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const orderPlaced = placedOrder !== null;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const leavingRef = useRef(false);
  // Signed in when the page loaded, or verified since.
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const signedInHereRef = useRef(false);
  const [verification, setVerification] = useState<PendingVerification | null>(
    null,
  );
  // The last code sent from this page: reopening the dialog for the same
  // contact reuses it instead of sending (and waiting out) another.
  const lastCodeRef = useRef<{
    contact: string;
    identifier: string;
    sentAt: number;
  } | null>(null);

  const [zone, setZone] = useState<DeliveryZone>(
    DELIVERY_ZONES.find((z) => z === initialUser?.zone) ?? "Inside Dhaka",
  );
  const [paymentOption, setPaymentOption] = useState<PaymentOptionId>("cod");
  // How the customer wants to be reached. Phone unless their account only
  // has an email (they signed in with one).
  const [contactMethod, setContactMethod] = useState<ContactMethod>(
    !initialUser?.phone && initialUser?.email ? "email" : "phone",
  );
  const [email, setEmail] = useState(initialUser?.email ?? "");

  const deliveryFee = items.length > 0 ? deliveryFeeFor(zone) : 0;
  // A coupon the customer applied, and what it takes off the products.
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponPending, setCouponPending] = useState(false);
  const discount = coupon?.discount ?? 0;
  const total = useMemo(
    () => Math.max(0, subtotal + deliveryFee - discount),
    [subtotal, deliveryFee, discount],
  );

  const applyCoupon = async () => {
    if (couponPending) return;
    setCouponPending(true);
    setCouponError("");
    const result = await validateCouponAction(couponInput, subtotal);
    setCouponPending(false);
    if (!result.ok) {
      setCouponError(result.error);
      return;
    }
    setCoupon({ code: result.code, discount: result.discount });
    setCouponInput("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (orderPlaced || submitting) return;
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();

    // The chosen contact must be valid; the other one is sent along too when
    // it's there (already on the account, or typed before switching).
    // PhoneInput leaves its value empty while the number isn't a valid one.
    const phone = field("customerPhone");
    const emailAddress = EMAIL_RE.test(email.trim()) ? email.trim() : "";
    if (contactMethod === "phone" && !phone) {
      setSubmitError(dict.checkoutPage.phone_invalid);
      return;
    }
    if (contactMethod === "email" && !emailAddress) {
      setSubmitError(dict.checkoutPage.email_invalid);
      return;
    }

    const order: PlaceOrderInput = {
      customerName: field("customerName"),
      customerPhone: phone,
      customerEmail: emailAddress,
      couponCode: coupon?.code,
      shippingAddress: { area: field("area"), zone },
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.id,
        name: item.name,
        quantity: item.qty,
        color: item.color,
        size: item.size,
      })),
      notes: field("notes"),
    };
    const contact = contactMethod === "phone" ? phone : emailAddress;

    setSubmitting(true);
    setSubmitError("");
    if (signedIn) {
      const result = await placeOrderAction(order);
      // The saved session turned out to be no good — verify like a newcomer.
      if (!result.ok && result.needsSignIn) {
        setSignedIn(false);
        await startVerification(order, contact);
      } else {
        finishOrder(result);
      }
    } else {
      await startVerification(order, contact);
    }
    setSubmitting(false);
  };

  // Not signed in: a one-time code goes to the contact they gave, and the
  // order waits in the dialog until it's confirmed.
  const startVerification = async (order: PlaceOrderInput, contact: string) => {
    const sentTo =
      contactMethod === "phone"
        ? (parsePhoneNumberFromString(contact)?.formatInternational() ??
          contact)
        : contact;

    const last = lastCodeRef.current;
    if (last?.contact === contact && Date.now() - last.sentAt < CODE_REUSE_MS) {
      setVerification({
        identifier: last.identifier,
        sentTo,
        channel: contactMethod,
        sentAt: last.sentAt,
        order,
      });
      return;
    }

    const result = await requestSigninOtpAction(contact);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    const sentAt = Date.now();
    lastCodeRef.current = { contact, identifier: result.identifier, sentAt };
    setVerification({
      identifier: result.identifier,
      sentTo,
      channel: contactMethod,
      sentAt,
      order,
    });
  };

  // The customer typed the code. One call confirms it, signs them in — the
  // account is created if their contact has none — and places the waiting
  // order on it. Returns a message only when the code itself was wrong.
  const submitCode = async (code: string): Promise<string | null> => {
    if (!verification) return null;
    const result = await verifyAndPlaceOrderAction({
      identifier: verification.identifier,
      otp: code,
      order: verification.order,
    });
    if (!result.ok && result.stage === "code") return result.error;

    setVerification(null);
    if (!result.ok) {
      // Something about the order needs fixing. The code wasn't used up, so
      // pressing "Place Order" again reopens the dialog with the same one.
      setSubmitError(result.error);
      return null;
    }

    lastCodeRef.current = null;
    if (result.signedIn) {
      setSignedIn(true);
      signedInHereRef.current = true;
      toast.success(
        result.isNewUser
          ? dict.checkoutPage.account_created
          : dict.checkoutPage.signed_in,
      );
    }
    finishOrder(result);
    return null;
  };

  const finishOrder = (
    result: Awaited<ReturnType<typeof placeOrderAction>>,
  ) => {
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    // The order now exists on the backend — empty the cart right away so a
    // reload or back-navigation can't place it twice.
    clear();
    setPlacedOrder(result.order);
  };

  const leaveTo = (href: string) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    // After signing in on this page, a full page navigation — so the header
    // and the next page render with the fresh session.
    if (signedInHereRef.current) window.location.href = href;
    else router.push(href);
  };

  // Once placed, keep rendering the form under the popup even after the
  // cart clears, instead of flashing the empty-cart state.
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) px-6 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
          <ShoppingCart size={36} />
        </span>
        <h3>{dict.cart.empty}</h3>
        <Link href="/" className="btn-primary btn-pill mt-2">
          {dict.cart.empty_cta}
        </Link>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* Everything the order needs, in one short card. */}
        <div className="flex flex-col gap-5 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
          {/* Contact — a phone number or an email, whichever the customer
            picks. Signed-in customers get theirs filled in. */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="mb-0">
                {dict.checkoutPage.contact_info}
                <Required />
              </label>
              <div
                role="radiogroup"
                aria-label={dict.checkoutPage.contact_info}
                className="flex items-center gap-x-5"
              >
                {(["phone", "email"] as const).map((method) => (
                  <RadioOption
                    key={method}
                    name="contactMethod"
                    value={method}
                    checked={contactMethod === method}
                    onChange={() => {
                      setContactMethod(method);
                      setSubmitError("");
                    }}
                  >
                    {method === "phone"
                      ? dict.checkoutPage.contact_phone
                      : dict.checkoutPage.contact_email}
                  </RadioOption>
                ))}
              </div>
            </div>

            {/* Both stay mounted, so switching back keeps what was typed. */}
            <div className={contactMethod === "phone" ? "" : "hidden"}>
              <label htmlFor="checkout-phone" className="sr-only">
                {dict.auth.phone}
              </label>
              <PhoneInput
                id="checkout-phone"
                name="customerPhone"
                required={contactMethod === "phone"}
                defaultValue={initialUser?.phone ?? undefined}
                invalidMessage={dict.checkoutPage.phone_invalid}
              />
            </div>
            <div className={contactMethod === "email" ? "" : "hidden"}>
              <label htmlFor="checkout-email" className="sr-only">
                {dict.auth.email}
              </label>
              <input
                id="checkout-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required={contactMethod === "email"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitError("");
                }}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-name">
              {dict.auth.full_name}
              <Required />
            </label>
            <input
              id="checkout-name"
              name="customerName"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              required
              defaultValue={initialUser?.name ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2">
              {dict.checkoutPage.delivery_zone}
              <Required />
            </label>
            <div
              role="radiogroup"
              aria-label={dict.checkoutPage.delivery_zone}
              className="flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {DELIVERY_ZONES.map((z) => (
                <RadioOption
                  key={z}
                  name="zone"
                  value={z}
                  checked={zone === z}
                  onChange={() => setZone(z)}
                >
                  {z === "Inside Dhaka"
                    ? dict.checkoutPage.inside_dhaka
                    : dict.checkoutPage.outside_dhaka}
                  {/* What picking this zone adds to the order. */}
                  <span className="font-normal text-(--color-text-muted)">
                    ({formatPrice(deliveryFeeFor(z))})
                  </span>
                </RadioOption>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="checkout-area">
              {dict.checkoutPage.address}
              <Required />
            </label>
            <textarea
              id="checkout-area"
              name="area"
              rows={2}
              required
              minLength={3}
              autoComplete="street-address"
              defaultValue={initialUser?.address ?? ""}
              placeholder={dict.checkoutPage.address_placeholder}
              className="rounded-lg px-4 py-3 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="checkout-notes">
              {dict.checkoutPage.order_notes}
            </label>
            <textarea
              id="checkout-notes"
              name="notes"
              rows={3}
              placeholder={dict.checkoutPage.order_notes_placeholder}
              className="rounded-lg px-4 py-3 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
            />
          </div>

          <div>
            <label className="mb-2">
              {dict.checkoutPage.payment_method}
              <Required />
            </label>
            <div
              role="radiogroup"
              aria-label={dict.checkoutPage.payment_method}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
            >
              {PAYMENT_OPTIONS.map((option) => {
                const selected = paymentOption === option.id;
                const label =
                  option.id === "cod"
                    ? dict.checkoutPage.cod
                    : option.id === "card"
                      ? dict.checkoutPage.card
                      : option.label;
                return (
                  <label
                    key={option.id}
                    aria-disabled={!option.available}
                    className={`relative mb-0 flex flex-col items-center gap-1.5 rounded-(--radius-md) border-2 px-2 py-3 text-center transition-colors ${
                      selected
                        ? "cursor-pointer border-(--color-primary) bg-(--color-primary-faint)"
                        : option.available
                          ? "cursor-pointer border-(--color-border) hover:border-(--color-primary)/50"
                          : "cursor-not-allowed border-(--color-border) opacity-60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.id}
                      checked={selected}
                      disabled={!option.available}
                      onChange={() => setPaymentOption(option.id)}
                      className="sr-only"
                    />
                    {selected && (
                      <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-(--color-primary) text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {option.id === "cod" ? (
                        <span className={logoTileClass}>
                          <Banknote
                            aria-hidden="true"
                            size={22}
                            className="text-(--color-success)"
                          />
                        </span>
                      ) : (
                        option.logos.map((logo) => (
                          <span key={logo} className={logoTileClass}>
                            <Image
                              src={logo}
                              alt=""
                              width={100}
                              height={64}
                              className="h-full w-full object-contain"
                            />
                          </span>
                        ))
                      )}
                    </span>
                    <span className="text-xs font-semibold text-(--color-dark)">
                      {label}
                    </span>
                    {!option.available && (
                      <span className="text-[10px] leading-none text-(--color-text-muted)">
                        {dict.checkoutPage.coming_soon}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {paymentOption === "cod" && (
              <p className="mt-2 text-xs text-(--color-text-muted)">
                {dict.checkoutPage.cod_hint}
              </p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="sticky top-24 flex flex-col gap-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
          <h3 className="text-base font-semibold text-(--color-dark)">
            {dict.checkoutPage.order_items}
          </h3>

          <div className="flex max-h-[280px] flex-col gap-3 overflow-y-auto">
            {items.map((item) => (
              <div key={cartLineKey(item)} className="flex items-center gap-3">
                <div
                  className={`relative size-12 shrink-0 overflow-hidden rounded-(--radius-md) ${
                    item.image ? "bg-white" : `bg-linear-to-br ${item.gradient}`
                  }`}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-white/90">
                      <ShoppingBag size={18} />
                    </span>
                  )}
                  <span className="absolute -end-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-(--color-dark) text-[10px] font-bold text-white">
                    {item.qty}
                  </span>
                </div>
                <p className="line-clamp-2 flex-1 text-xs text-(--color-text-muted)">
                  {item.name}
                  {(item.color || item.size) && (
                    <span className="block font-medium text-(--color-dark)">
                      {[item.color, item.size].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </p>
                <span className="shrink-0 text-sm font-medium text-(--color-dark)">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 border-t border-(--color-border) pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-(--color-text-muted)">
                {dict.cart.subtotal}
              </span>
              <span className="font-medium text-(--color-dark)">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-text-muted)">
                {dict.checkoutPage.delivery_fee}
              </span>
              <span className="font-medium text-(--color-dark)">
                {formatPrice(deliveryFee)}
              </span>
            </div>
            {coupon && (
              <div className="flex items-center justify-between text-(--color-success)">
                <span>
                  {dict.checkoutPage.discount} ({coupon.code})
                </span>
                <span className="font-medium">−{formatPrice(discount)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-(--color-border) pt-3">
            <span className="font-semibold text-(--color-dark)">
              {dict.cart.total}
            </span>
            <span className="price text-lg">{formatPrice(total)}</span>
          </div>

          {/* Coupon — typed and applied here, right above the order button. */}
          {coupon ? (
            <p className="flex items-center justify-between gap-2 rounded-(--radius-md) bg-(--color-primary-faint) px-3.5 py-2.5 text-sm text-(--color-dark)">
              <span className="flex min-w-0 items-center gap-2">
                <TicketPercent
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 text-(--color-primary)"
                />
                <span className="truncate">
                  <strong className="font-semibold">{coupon.code}</strong>{" "}
                  {dict.checkoutPage.coupon_applied}
                </span>
              </span>
              <button
                type="button"
                aria-label={dict.checkoutPage.coupon_remove}
                onClick={() => setCoupon(null)}
                className="flex size-6 shrink-0 items-center justify-center rounded-full p-0 text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-dark)"
              >
                <X size={14} />
              </button>
            </p>
          ) : (
            <div>
              <label htmlFor="checkout-coupon" className="sr-only">
                {dict.checkoutPage.coupon_label}
              </label>
              <div className="flex gap-2">
                <input
                  id="checkout-coupon"
                  type="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  // Enter applies the coupon instead of placing the order.
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (couponInput.trim()) void applyCoupon();
                  }}
                  placeholder={dict.checkoutPage.coupon_placeholder}
                  className="h-11 min-w-0 flex-1 rounded-lg px-3.5 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon()}
                  disabled={couponPending || !couponInput.trim()}
                  className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-(--color-dark) px-4 text-sm font-semibold text-(--color-dark) transition-colors hover:bg-(--color-dark) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {couponPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {dict.checkoutPage.coupon_apply}
                </button>
              </div>
              {couponError && (
                <p role="alert" className="mt-1.5 text-xs text-(--color-error)">
                  {couponError}
                </p>
              )}
            </div>
          )}

          {submitError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-(--radius-md) bg-red-50 px-3.5 py-3 text-sm font-medium text-(--color-error)"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={orderPlaced || submitting}
            aria-busy={submitting}
            className="btn-primary btn-pill inline-flex h-13 w-full items-center justify-center gap-2 text-base shadow-lg shadow-(--color-primary)/25 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Package size={18} />
            )}
            {dict.checkoutPage.place_order}
          </button>

          {/* So the code that follows "Place Order" isn't a surprise. */}
          {!signedIn && !orderPlaced && (
            <p className="text-center text-xs text-(--color-text-muted)">
              {dict.checkoutPage.verify_hint}
            </p>
          )}

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-(--color-text-light)">
            <ShieldCheck size={13} />
            <LockKeyhole size={13} />
            Secure checkout · Your information is protected
          </p>
        </div>

        {placedOrder && (
          <OrderSuccessModal
            orderId={placedOrder.orderNumber}
            title={dict.checkoutPage.order_success_title}
            message={dict.checkoutPage.order_success_message}
            orderIdLabel={dict.checkoutPage.order_id}
            totalLabel={dict.cart.total}
            totalValue={formatPrice(placedOrder.total)}
            checkOrderLabel={dict.checkoutPage.check_order}
            backToHomeLabel={dict.checkoutPage.back_to_home}
            redirectingLabel={dict.checkoutPage.redirecting_home}
            onCheckOrder={() =>
              // Order history needs the session; without one (it failed to
              // start) the tracking page finds the order by phone or email.
              leaveTo(
                `${signedIn ? "/orders" : "/orders/track"}?id=${encodeURIComponent(placedOrder.orderNumber)}`,
              )
            }
            onBackHome={() => leaveTo("/")}
          />
        )}
      </form>

      {/* Outside the checkout form: the dialog has a form of its own, and a
        form can't sit inside another. */}
      {verification && (
        <OrderVerifyDialog
          // A different contact starts the dialog afresh.
          key={verification.identifier}
          identifier={verification.identifier}
          sentTo={verification.sentTo}
          channel={verification.channel}
          sentAt={verification.sentAt}
          onSubmitCode={submitCode}
          onResent={(sentAt) => {
            if (lastCodeRef.current) lastCodeRef.current.sentAt = sentAt;
          }}
          onClose={() => setVerification(null)}
        />
      )}
    </>
  );
};

export default CheckoutDetails;
