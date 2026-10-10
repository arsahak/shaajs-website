"use server";

import { auth } from "@/auth";
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
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    division: string;
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
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

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

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Please sign in to place your order." };

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

  const phone = normalizePhone(input.customerPhone);
  if (!/^[+]?[0-9]{7,15}$/.test(phone)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName: input.customerName.trim(),
        customerPhone: phone,
        customerEmail: input.customerEmail?.trim() || undefined,
        shippingAddress: input.shippingAddress,
        items,
        // Customers can only pay cash on delivery for now (backend enforces).
        paymentMethod: "cod",
        notes: input.notes?.trim() || undefined,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

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
