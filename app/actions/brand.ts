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
  sortOrder: number;
}

interface BrandDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
}

// ── List brands (public backend endpoint — no auth required) ──────────────────

export async function listBrandsAction(): Promise<BrandDataResponse<Brand[]>> {
  try {
    const res = await fetch(`${API}/brands`, {
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
