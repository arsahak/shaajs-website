"use server";

import { auth, signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { getCatalogProductAction } from "./products";

const API = `${process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app"}/api/v1`;

// ── Types (mirror backend/models/order.model.ts) ─────────────────────────────

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  product: string;
  title: string;
  image: string;
  sku: string;
  /** The ordered variation — "" (or absent on older orders) when none applies. */
  color?: string;
  size?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: {
    division?: string;
    district?: string;
    upazila?: string;
    postOffice?: string;
    postCode?: string;
    area?: string;
    zone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: "cod" | "bkash" | "nagad" | "card";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface OrderPagination {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PlaceOrderInput {
  customerName: string;
  /** At least one of phone and email — the customer picks how to be reached. */
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress: {
    division?: string;
    district?: string;
    upazila?: string;
    postOffice?: string;
    postCode?: string;
    area: string;
    zone: string;
  };
  /** productId when known; slug lets older cart items be resolved. */
  items: {
    productId?: string;
    slug: string;
    name: string;
    quantity: number;
    /** The chosen variation, for products that have colors / sizes. */
    color?: string;
    size?: string;
  }[];
  notes?: string;
  /** A coupon the customer applied; the backend checks it again. */
  couponCode?: string;
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  // `needsSignIn`: nobody is signed in (or the saved session is no longer
  // accepted) — the checkout then verifies the customer by OTP and retries.
  | { ok: false; error: string; needsSignIn?: true };

// ── Helpers ──────────────────────────────────────────────────────────────────

const OBJECT_ID = /^[a-f\d]{24}$/i;

async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  return session?.user?.accessToken ?? null;
}

function errorMessage(body: unknown, fallback: string): string {
  const b = body as { errors?: string[]; message?: string } | null;
  return b?.errors?.[0] || b?.message || fallback;
}

// Backend PHONE_REGEX is /^[+]?[0-9]{7,15}$/ — no spaces, dashes or brackets.
function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

// ── Place order ──────────────────────────────────────────────────────────────

// What the backend's order endpoints take. Shared by the signed-in order and
// by the verify-and-order of a newcomer, so both send exactly the same thing.
async function buildOrderPayload(
  input: PlaceOrderInput,
): Promise<
  { ok: true; payload: Record<string, unknown> } | { ok: false; error: string }
> {
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // Items added before productId was tracked only carry their slug — look the
  // real id up so they can still be ordered. Then merge duplicates, since the
  // backend rejects the same product variation (color + size) appearing twice.
  const lines = new Map<
    string,
    { product: string; quantity: number; color?: string; size?: string }
  >();
  for (const item of input.items) {
    let productId = item.productId && OBJECT_ID.test(item.productId) ? item.productId : null;
    if (!productId) {
      const res = await getCatalogProductAction(item.slug);
      productId = res.ok && res.data ? res.data._id : null;
    }
    if (!productId) {
      return {
        ok: false,
        error: `"${item.name}" is no longer available. Please remove it from your cart.`,
      };
    }
    const color = item.color?.trim() || undefined;
    const size = item.size?.trim() || undefined;
    const key = [productId, color ?? "", size ?? ""].join("|").toLowerCase();
    const line = lines.get(key);
    if (line) line.quantity += item.quantity;
    else lines.set(key, { product: productId, quantity: item.quantity, color, size });
  }

  const items = Array.from(lines.values());
  if (items.some((item) => item.quantity > 99)) {
    return { ok: false, error: "You can order at most 99 of each product." };
  }

  const phone = normalizePhone(input.customerPhone ?? "");
  const email = input.customerEmail?.trim() ?? "";
  if (!phone && !email) {
    return { ok: false, error: "Please enter a phone number or an email." };
  }
  if (phone && !/^[+]?[0-9]{7,15}$/.test(phone)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  return {
    ok: true,
    payload: {
      customerName: input.customerName.trim(),
      customerPhone: phone || undefined,
      customerEmail: email || undefined,
      shippingAddress: input.shippingAddress,
      items,
      // Customers can only pay cash on delivery for now (backend enforces).
      paymentMethod: "cod",
      notes: input.notes?.trim() || undefined,
      couponCode: input.couponCode?.trim() || undefined,
    },
  };
}

/** Places the order of a customer who is already signed in. */
export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const token = await getAccessToken();
  if (!token) {
    return {
      ok: false,
      error: "Please verify your phone or email to place the order.",
      needsSignIn: true,
    };
  }

  const built = await buildOrderPayload(input);
  if (!built.ok) return built;

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(built.payload),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    // A saved session the backend no longer accepts (expired, or the account
    // is gone): the checkout verifies the customer again and retries.
    if (res.status === 401) {
      return {
        ok: false,
        error: "Please verify your phone or email to place the order.",
        needsSignIn: true,
      };
    }

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: errorMessage(body, "Could not place your order.") };
    }

    revalidatePath("/", "layout");
    return { ok: true, order: body.data as Order };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export type VerifyAndPlaceOrderResult =
  | {
      ok: true;
      order: Order;
      /** True when this order created the customer's account. */
      isNewUser: boolean;
      /** False only if the order went through but the session couldn't start. */
      signedIn: boolean;
    }
  // `stage` says what was wrong: the code the customer typed, or the order
  // itself (in which case the same code is still good for another try).
  | { ok: false; error: string; stage: "code" | "order" };

const CODE_ERROR_MESSAGES: { match: RegExp; message: string }[] = [
  { match: /^Incorrect/i, message: "Incorrect code. Please try again." },
  { match: /expired/i, message: "This code has expired. Please request a new one." },
  { match: /too many/i, message: "Too many incorrect attempts. Please request a new code." },
];

/**
 * The checkout of a visitor who isn't signed in, in one step: confirms the
 * code sent to their phone/email, signs them in — creating their account if
 * that contact has none — and places the order on it.
 */
export async function verifyAndPlaceOrderAction(input: {
  /** The email/phone the code was sent to, as the backend normalized it. */
  identifier: string;
  otp: string;
  order: PlaceOrderInput;
}): Promise<VerifyAndPlaceOrderResult> {
  const built = await buildOrderPayload(input.order);
  if (!built.ok) return { ...built, stage: "order" };

  let data: { order: Order; token?: string; isNewUser?: boolean };
  try {
    const res = await fetch(`${API}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...built.payload,
        identifier: input.identifier.trim(),
        otp: input.otp.trim(),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data?.order) {
      const raw = errorMessage(body, "Could not place your order.");
      // The backend answers 400/429 only for the code; anything else is
      // about the order (422) or the account (403).
      if (res.status === 400 || res.status === 429) {
        return {
          ok: false,
          stage: "code",
          error:
            CODE_ERROR_MESSAGES.find(({ match }) => match.test(raw))?.message ??
            "Please request a new code.",
        };
      }
      return { ok: false, stage: "order", error: raw };
    }
    data = body.data;
  } catch {
    return {
      ok: false,
      stage: "order",
      error: "Network error. Please try again.",
    };
  }

  // The order exists from here on. Starting the session is the last step —
  // if it fails the customer still has their order and can sign in later.
  let signedIn = false;
  if (data.token) {
    try {
      await signIn("customer-token", { token: data.token, redirect: false });
      signedIn = true;
    } catch (error) {
      console.error("Order placed, but the session could not be started:", error);
    }
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    order: data.order,
    isNewUser: Boolean(data.isNewUser),
    signedIn,
  };
}

// ── Order history ────────────────────────────────────────────────────────────

export type MyOrdersResult =
  | { ok: true; orders: Order[]; pagination: OrderPagination }
  | { ok: false; error: string };

export async function getMyOrdersAction(page = 1): Promise<MyOrdersResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Please sign in to see your orders." };

  try {
    const res = await fetch(`${API}/orders/my-orders?page=${Math.max(1, page)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: errorMessage(body, "Could not load your orders.") };
    }
    return {
      ok: true,
      orders: body.data.orders as Order[],
      pagination: body.data.pagination as OrderPagination,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Single order lookup (Track Order) ────────────────────────────────────────

export type TrackOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "auth" | "not_found" | "error" };

/** Looks up one of the signed-in customer's orders by its id or order number. */
export async function getMyOrderAction(
  idOrNumber: string,
): Promise<TrackOrderResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: "auth" };

  const id = idOrNumber.trim();
  if (!id) return { ok: false, reason: "not_found" };

  try {
    const res = await fetch(
      `${API}/orders/my-orders/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: "auth" };
    }
    if (res.status === 404) return { ok: false, reason: "not_found" };

    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data) return { ok: false, reason: "error" };
    return { ok: true, order: body.data as Order };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/**
 * Looks up an order without an account — for customers who checked out as
 * guests. Needs the order number and the phone number or email it was placed
 * with.
 */
export async function trackGuestOrderAction(
  orderNumber: string,
  contact: string,
): Promise<TrackOrderResult> {
  const number = orderNumber.trim();
  const isEmail = contact.includes("@");
  const email = isEmail ? contact.trim().toLowerCase() : "";
  const phone = isEmail ? "" : normalizePhone(contact);
  if (!number || (!email && !/^[+]?[0-9]{7,15}$/.test(phone))) {
    return { ok: false, reason: "not_found" };
  }

  try {
    const res = await fetch(`${API}/orders/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: number,
        ...(email ? { email } : { phone }),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404 || res.status === 422) {
      return { ok: false, reason: "not_found" };
    }

    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data) return { ok: false, reason: "error" };
    return { ok: true, order: body.data as Order };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// ── Coupon ───────────────────────────────────────────────────────────────────

export type CouponResult =
  | { ok: true; code: string; discount: number }
  | { ok: false; error: string };

/**
 * The checkout's "Apply" button: what a coupon code takes off products worth
 * `subtotal`. Nothing is used up — the order itself checks the code again.
 */
export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "Please enter a coupon code." };

  try {
    const res = await fetch(`${API}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: trimmed, subtotal }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data) {
      return { ok: false, error: errorMessage(body, "Invalid coupon code.") };
    }
    return {
      ok: true,
      code: String(body.data.code),
      discount: Number(body.data.discount) || 0,
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
