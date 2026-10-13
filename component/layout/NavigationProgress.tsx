"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// How long the bar takes to creep most of the way across while a page loads,
// and how long it stays once the page has arrived, to be seen finishing.
const CREEP_MS = 8000;
const FINISH_MS = 250;
// If a navigation never lands (a failed request), the bar gives up.
const GIVE_UP_MS = 15000;

type Phase = "idle" | "loading" | "done";

/**
 * A thin bar across the very top of the window that starts the instant a
 * link to another page is clicked and finishes when that page shows. It is
 * what tells the visitor their click was taken, on every link — the logo,
 * the menus, a product card — including the moves that have no loading
 * skeleton of their own (changing a filter in the address, say).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The address changed: the page asked for has arrived.
  useEffect(() => {
    setPhase((current) => (current === "loading" ? "done" : current));
  }, [pathname, searchParams]);

  // After finishing, the bar fades out; while loading, it eventually gives up.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (phase === "done") {
      timerRef.current = setTimeout(() => setPhase("idle"), FINISH_MS + 200);
    } else if (phase === "loading") {
      timerRef.current = setTimeout(() => setPhase("done"), GIVE_UP_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Only a plain left click that the page itself will follow.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      // The same page (or just a jump to a heading on it): nothing loads.
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }
      setPhase("loading");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div
        className="h-full rounded-e-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
        style={
          phase === "loading"
            ? {
                width: "85%",
                opacity: 1,
                // Quick off the mark, then slower and slower.
                transition: `width ${CREEP_MS}ms cubic-bezier(0.1, 0.7, 0.1, 1)`,
              }
            : phase === "done"
              ? {
                  width: "100%",
                  opacity: 0,
                  transition: `width ${FINISH_MS}ms ease-out, opacity 200ms ease-out ${FINISH_MS}ms`,
                }
              : { width: "0%", opacity: 0, transition: "none" }
        }
      />
    </div>
  );
}

export default NavigationProgress;
