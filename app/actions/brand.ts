"use server";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  /** Picked in the dashboard as one of the store's top brands. */
  isTopBrand?: boolean;
  sortOrder: number;
  /** Active products sold under this brand. */
  productCount?: number;
}

interface BrandDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
}

// ── List brands (public backend endpoint — no auth required) ──────────────────

// `top: true` asks for the top brands only (a short list, for the header).
export async function listBrandsAction(
  options: { top?: boolean } = {},
): Promise<BrandDataResponse<Brand[]>> {
  try {
    const res = await fetch(`${API}/brands${options.top ? "?top=true" : ""}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: "Failed to fetch brands." };
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
