"use client";

import {
  getMyOrderAction,
  trackGuestOrderAction,
  type Order,
  type OrderStatus,
} from "@/app/actions/order";
import type { Dictionary } from "@/app/dictionaries";
import { formatPrice } from "@/app/utils/format-price";
import { useAuthModal } from "@/component/providers/AuthModalProvider";
import {
  ArrowRight,
  Check,
  Loader2,
  LogIn,
  PackageSearch,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";

interface TrackOrderProps {
  dict: Dictionary;
  isSignedIn: boolean;
  /** Order number from the URL (?id=…) — looked up straight away. */
  initialOrderNumber?: string;
}

// The stages an order moves through, in order. "cancelled" sits outside them.
const STAGES: Exclude<OrderStatus, "cancelled">[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

type Lookup =
  | { state: "idle" }
  | { state: "found"; order: Order }
  | { state: "error"; message: string };

const ERROR_MESSAGE = {
  auth: "Please sign in to track your order.",
  not_found:
    "We could not find that order on your account. Check the number and try again.",
  guest_not_found:
    "We could not find an order with that number and phone number or email. Check both and try again.",
  error: "Something went wrong while looking up your order. Please try again.",
};

export function TrackOrder({
  dict,
  isSignedIn,
  initialOrderNumber = "",
}: TrackOrderProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  // Guests only: the phone number or email the order was placed with.
  const [contact, setContact] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });
  const [pending, startTransition] = useTransition();
  const { openAuth } = useAuthModal();

  const stageLabel: Record<OrderStatus, string> = {
    pending: dict.orders.status_pending,
    processing: dict.orders.status_processing,
    shipped: dict.orders.status_shipped,
    delivered: dict.orders.status_delivered,
    cancelled: dict.orders.status_cancelled,
  };

  // Signed in: one of the account's own orders. Guest: any order, proven by
  // the phone number or email it was placed with.
  const runLookup = (value: string, guestContact = contact) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = isSignedIn
        ? await getMyOrderAction(trimmed)
        : await trackGuestOrderAction(trimmed, guestContact);
      setLookup(
        result.ok
          ? { state: "found", order: result.order }
          : {
              state: "error",
              message:
                !isSignedIn && result.reason === "not_found"
                  ? ERROR_MESSAGE.guest_not_found
                  : ERROR_MESSAGE[result.reason],
            },
      );
    });
  };

  // Signed in and arriving with an order number (?id=…): looked up straight
  // away. Without an account the phone or email is needed first.
  useEffect(() => {
    if (isSignedIn && initialOrderNumber) runLookup(initialOrderNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runLookup(orderNumber);
  };

  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent("/orders/track")}`;
  const order = lookup.state === "found" ? lookup.order : null;
  const activeStage = order
    ? STAGES.indexOf(order.orderStatus as (typeof STAGES)[number])
    : -1;
  const itemCount =
    order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="rounded-(--radius-2xl) border border-(--color-border) bg-(--color-surface) p-6 text-start sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
          <PackageSearch size={20} />
        </span>
        <div>
          <h2 className="section-title">Where is my order?</h2>
          <p className="section-subtitle mt-1">
            {isSignedIn
              ? "Enter the order number from your confirmation to see its latest status."
              : "Enter the order number from your confirmation and the phone number or email you ordered with."}
          </p>
        </div>
      </div>

      {isSignedIn ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex h-[46px] items-stretch overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg) transition-all focus-within:border-(--color-primary) focus-within:bg-(--color-surface) focus-within:shadow-[0_0_0_3px_var(--color-primary-faint)] sm:max-w-xl"
        >
          <label htmlFor="track-order-number" className="sr-only">
            Order number
          </label>
          <input
            id="track-order-number"
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number"
            className="w-full min-w-0 border-0 bg-transparent px-4 text-sm shadow-none outline-none placeholder:text-(--color-text-light)"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-primary me-1.5 shrink-0 self-center rounded-full px-4"
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {dict.topbar.track_order}
          </button>
        </form>
      ) : (
        // No account: the order number and the phone or email it was placed with.
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:max-w-xl"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="track-order-number">Order number</label>
              <input
                id="track-order-number"
                type="text"
                required
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Order number"
                className="h-12 rounded-lg px-4 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="track-order-contact">Phone or email</label>
              <input
                id="track-order-contact"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="01XXX-XXXXXX / name@example.com"
                className="h-12 rounded-lg px-4 text-base focus:border-(--color-dark) focus:shadow-none focus:outline-none sm:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary btn-pill inline-flex items-center gap-2 px-6 py-2.5 font-semibold"
            >
              {pending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {dict.topbar.track_order}
            </button>
            <Link
              href={signInHref}
              onClick={(event) => {
                event.preventDefault();
                openAuth("sign-in", { callbackUrl: "/orders/track" });
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
            >
              <LogIn aria-hidden="true" size={15} className="shrink-0" />
              Have an account? {dict.nav.sign_in}
            </Link>
          </div>
        </form>
      )}

      {lookup.state === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-(--radius-lg) border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-(--color-error)"
        >
          {lookup.message}
        </p>
      )}

      {order && (
        <div
          aria-live="polite"
          className="mt-6 overflow-hidden rounded-(--radius-lg) border border-(--color-border)"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-bg) px-5 py-3">
            <span className="font-mono text-sm font-bold tracking-wide text-(--color-dark)">
              {order.orderNumber}
            </span>
            <span className="text-xs text-(--color-text-muted)">
              {dict.orders.placed_on}{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(order.createdAt))}
            </span>
          </header>

          <div className="px-5 py-6">
            {order.orderStatus === "cancelled" ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-(--color-error)">
                <XCircle size={18} />
                {stageLabel.cancelled}
              </p>
            ) : (
              <ol className="flex list-none items-start ps-0 [&>li]:m-0">
                {STAGES.map((stage, i) => {
                  const done = i <= activeStage;

                  return (
                    <li
                      key={stage}
                      className="relative flex flex-1 flex-col items-center gap-2 text-center"
                    >
                      {i > 0 && (
                        <span
                          aria-hidden="true"
                          className={`absolute end-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                            done ? "bg-(--color-primary)" : "bg-(--color-border)"
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? "bg-(--color-primary) text-white"
                            : "border border-(--color-border) bg-(--color-surface) text-(--color-text-light)"
                        }`}
                      >
                        {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={`text-xs leading-tight ${
                          i === activeStage
                            ? "font-semibold text-(--color-dark)"
                            : "text-(--color-text-muted)"
                        }`}
                      >
                        {stageLabel[stage]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border) px-5 py-4">
            <p className="text-sm text-(--color-text-muted)">
              {itemCount} {dict.cart.items} · {dict.cart.total}{" "}
              <strong>{formatPrice(order.total)}</strong>
            </p>
            {/* Order history belongs to an account — a guest has none. */}
            {isSignedIn && (
              <Link
                href={`/orders?id=${encodeURIComponent(order.orderNumber)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold"
              >
                {dict.orders.title}
                <ArrowRight size={16} />
              </Link>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
