"use server";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Who or what a product is best for — "Dry Skin", "Men", "Eid". The list has
 * two levels: an entry with no `parent` is a group ("Skin Type"); one with a
 * `parent` is an option in that group ("Dry"), and options are what products
 * are tagged with.
 */
export interface BestFor {
  _id: string;
  name: string;
  slug: string;
  /** The group's id; null or absent when the entry is itself a group. */
  parent?: string | null;
  /** The icon its card shows when it has no picture — an icon name. */
  icon?: string;
  /** The picture on its card, shown in place of the icon; "" for none. */
  image?: string;
  /** The card's background gradient: two #rrggbb colors, start then end. */
  colors?: string[];
  isActive: boolean;
  /**
   * Picked in the dashboard for the homepage: a pinned option, or every
   * option of a pinned group, gets a card there.
   */
  isPinned?: boolean;
  sortOrder: number;
  /** Active products tagged with this option. */
  productCount?: number;
}

interface BestForDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.message === "string" ? body.message : fallback;
  } catch {
    return fallback;
  }
}

// ── List groups and options (public backend endpoint — no auth required) ─────
// Active entries only: an inactive option, or any option of an inactive
// group, is left out by the backend. Comes back in display order.

export async function listBestForAction(): Promise<
  BestForDataResponse<BestFor[]>
> {
  try {
    const res = await fetch(`${API}/best-for?active=true`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        error: await parseError(res, "Failed to fetch the Best For list."),
      };
    }
    const body = await res.json();
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
