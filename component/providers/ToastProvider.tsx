"use client";

import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

type FlashToast = { type: "success" | "error"; message: string };

const FLASH_KEY = "bongoocean-flash-toast";

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

/** Site-wide toast outlet (bottom-right). Mounted once in the root layout. */
export function ToastProvider() {
  useEffect(() => {
    showQueuedToast();
  }, []);

  return (
    <Toaster
      position="bottom-right"
      // On phones, clear the floating wishlist/cart buttons in that corner.
      containerClassName="max-sm:!bottom-40"
      toastOptions={{
        duration: 4000,
        // Theme tokens, so toasts follow light/dark mode.
        style: {
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
