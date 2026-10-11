"use client";

import type { Dictionary } from "@/app/dictionaries";
import { animate, useReducedMotion } from "framer-motion";
import { Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Where the highlight sat on the account page the visitor just left. Each
// page renders its own copy of this menu, so this is what lets the highlight
// glide from the old tab to the new one instead of jumping.
let lastHighlight: Box | null = null;

const GLIDE = { type: "spring", stiffness: 340, damping: 32, mass: 0.9 } as const;

/**
 * The account pages' menu: Profile, Orders, Settings. A column down the left
 * side on wide screens, a row of tabs across the top on phones. Shown on each
 * of the pages, so moving between the three is one tap — and the highlight
 * slides to the tab that was picked.
 */
export function AccountNav({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  // Where this page's highlight sets off from — fixed the first time the
  // effect below runs for a page, so running it again (as React does in
  // development) replays the same glide instead of starting from the end.
  const glideFromRef = useRef<{ pathname: string; box: Box | null } | null>(
    null,
  );

  const tabs = [
    {
      href: "/account",
      label: dict.nav.profile,
      icon: User,
      // Editing the profile is still "Profile".
      active: pathname === "/account" || pathname.startsWith("/account/edit"),
    },
    {
      href: "/orders",
      label: dict.nav.orders,
      icon: Package,
      active: pathname === "/orders",
    },
    {
      href: "/account/settings",
      label: dict.nav.settings,
      icon: Settings,
      active: pathname.startsWith("/account/settings"),
    },
  ];

  // Before the first paint: put the highlight where the last page left it and
  // send it to the current tab. Measured from the tabs themselves, so the
  // same code serves the column and the row.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const highlight = highlightRef.current;
    if (!nav || !highlight) return;

    if (glideFromRef.current?.pathname !== pathname) {
      glideFromRef.current = { pathname, box: lastHighlight };
    }
    const glideFrom = glideFromRef.current.box;

    let controls: ReturnType<typeof animate> | undefined;
    const place = (glide: boolean) => {
      const tab = nav.querySelector<HTMLElement>('[aria-current="page"]');
      controls?.stop();
      if (!tab) {
        highlight.style.opacity = "0";
        return;
      }

      const to: Box = {
        x: tab.offsetLeft,
        y: tab.offsetTop,
        width: tab.offsetWidth,
        height: tab.offsetHeight,
      };
      const from = glide && !reduceMotion ? glideFrom : null;
      highlight.style.opacity = "1";
      controls = from
        ? animate(
            highlight,
            {
              x: [from.x, to.x],
              y: [from.y, to.y],
              width: [from.width, to.width],
              height: [from.height, to.height],
            },
            GLIDE,
          )
        : animate(
            highlight,
            { x: to.x, y: to.y, width: to.width, height: to.height },
            { duration: 0 },
          );
      lastHighlight = to;
    };

    place(true);
    // From here the moving highlight is the active tab's background; until
    // now (server render, before scripts) the tab carried a plain one.
    nav.dataset.ready = "true";

    // A resize (or the row/column switch) just re-seats it, no glide. An
    // observer always reports once as soon as it starts watching — that
    // first report is skipped, or it would cut the glide short.
    let watching = false;
    const observer = new ResizeObserver(() => {
      if (watching) place(false);
      watching = true;
    });
    observer.observe(nav);
    return () => {
      observer.disconnect();
      controls?.stop();
    };
  }, [pathname, reduceMotion]);

  return (
    <nav
      ref={navRef}
      aria-label={dict.nav.account}
      className="group relative flex gap-1 overflow-x-auto rounded-full border border-(--color-border) bg-(--color-surface) p-1 lg:flex-col lg:overflow-visible lg:rounded-(--radius-lg) lg:p-2 lg:shadow-(--shadow-sm)"
    >
      <span
        ref={highlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-(--color-primary) opacity-0 shadow-[0_6px_16px_-6px_var(--color-primary)] lg:rounded-(--radius-md)"
      />
      {tabs.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`group/tab relative z-10 flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors duration-300 lg:h-11 lg:flex-none lg:justify-start lg:gap-3 lg:rounded-(--radius-md) lg:px-4 ${
            active
              ? "bg-(--color-primary) text-white group-data-ready:bg-transparent hover:text-white"
              : "text-(--color-text-muted) hover:bg-(--color-bg) hover:text-(--color-dark)"
          }`}
        >
          <Icon
            aria-hidden="true"
            size={16}
            className="shrink-0 transition-transform duration-300 group-hover/tab:scale-110"
          />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default AccountNav;
