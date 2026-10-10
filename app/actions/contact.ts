"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

// Both forms post to the backend's POST /messages/contact. Each submission
// lands in the dashboard's Messages inbox next to the live chats, so staff
// answer everything from one list.

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  /** Human-readable topic, e.g. "Returns & refunds". */
  topic?: string;
  orderNumber?: string;
  message: string;
  /** Honeypot — left empty by real visitors, filled in by form-spam bots. */
  website?: string;
}

export type ContactResult =
  | { ok: true; duplicate: boolean }
  | { ok: false; error: string };

async function postToInbox(
  payload: Record<string, string | undefined>,
): Promise<ContactResult> {
  const session = await auth();
  const token = session?.user?.accessToken;
  // This request leaves from the website's server, so tell the backend which
  // visitor it is for — its spam limit counts per visitor, not per server.
  const visitorIp = ((await headers()).get("x-forwarded-for") ?? "")
    .split(",")[0]
    .trim();

  try {
    const res = await fetch(`${API}/messages/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // A signed-in customer's message joins their own conversation.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(visitorIp ? { "X-Forwarded-For": visitorIp } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const body = (await res.json().catch(() => null)) as {
      message?: string;
      errors?: string[];
      data?: { duplicate?: boolean } | null;
    } | null;
    if (!res.ok) {
      return {
        ok: false,
        error:
          body?.errors?.[0] ||
          body?.message ||
          "Could not send your message. Please try again.",
      };
    }
    return { ok: true, duplicate: Boolean(body?.data?.duplicate) };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

/** The contact page form. */
export async function sendContactMessageAction(
  input: ContactMessageInput,
): Promise<ContactResult> {
  return postToInbox({
    source: "contact",
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    topic: input.topic?.trim() || undefined,
    orderNumber: input.orderNumber?.trim() || undefined,
    message: input.message.trim(),
    website: input.website,
  });
}

/** The footer newsletter sign-up — just an email address. */
export async function subscribeNewsletterAction(
  email: string,
): Promise<ContactResult> {
  return postToInbox({ source: "newsletter", email: email.trim() });
}
