"use client";

import { useEffect, useSyncExternalStore } from "react";
import toast, { Toaster } from "react-hot-toast";

type FlashToast = { type: "success" | "error"; message: string };

const FLASH_KEY = "Shaajs-flash-toast";

/**
 * Queue a toast to show after the next full page load. Use it right before a
 * `window.location` navigation (e.g. after sign-up, which reloads to pick up
 * the new session) — a toast fired directly would disappear with the page.
 * For everything else, call `toast` from "react-hot-toast" as usual.
 */
export function queueToast(type: FlashToast["type"], message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, message }));
  } catch {
    // Storage blocked (private mode etc.) — the toast is simply skipped.
  }
}

function showQueuedToast() {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FLASH_KEY);
    const flash = JSON.parse(raw) as FlashToast;
    // A fixed id keeps React's double-invoked dev effects from showing it twice.
    toast[flash.type === "error" ? "error" : "success"](flash.message, {
      id: FLASH_KEY,
    });
  } catch {
    // Ignore malformed or unavailable storage.
  }
}

// Phones: anything narrower than Tailwind's `sm` breakpoint.
const PHONE_QUERY = "(max-width: 639.98px)";

function subscribeToPhoneQuery(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Site-wide toast outlet — bottom-centre on phones, bottom-right on anything
 * wider. Mounted once in the root layout.
 */
export function ToastProvider() {
  useEffect(() => {
    showQueuedToast();
  }, []);

  const isPhone = useSyncExternalStore(
    subscribeToPhoneQuery,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );

  return (
    <Toaster
      position={isPhone ? "bottom-center" : "bottom-right"}
      // No lift on phones: toasts sit at the very bottom, drawn over the
      // floating wishlist/cart buttons (the toaster's z-index is far above).
      toastOptions={{
        duration: 4000,
        // Theme tokens, so toasts follow light/dark mode.
        style: {
          // Centred text on phones (the toast itself is centred there);
          // left-aligned on wider screens.
          textAlign: isPhone ? "center" : "left",
          fontSize: "0.875rem",
          fontWeight: 500,
          maxWidth: "min(24rem, calc(100vw - 2rem))",
          background: "var(--color-surface)",
          color: "var(--color-dark)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
        },
        success: {
          duration: 5000,
          iconTheme: {
            primary: "var(--color-success)",
            secondary: "var(--color-surface)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-error)",
            secondary: "var(--color-surface)",
          },
        },
      }}
    />
  );
}

export default ToastProvider;
