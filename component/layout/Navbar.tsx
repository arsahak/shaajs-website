"use client";

import { signoutAction } from "@/app/actions/auth";
import type { Brand } from "@/app/actions/brand";
import { navCategories } from "@/app/data/categories";
import { formatPhoneDisplay } from "@/app/data/phone-countries";
import type { Dictionary } from "@/app/dictionaries";
import { Logo } from "@/component/common/Logo";
import { AnnouncementBar } from "@/component/layout/AnnouncementBar";
import { BrandMenu } from "@/component/layout/BrandMenu";
import { MegaMenu } from "@/component/layout/MegaMenu";
import { MobileQuickActions } from "@/component/layout/MobileQuickActions";
import { NavSearch } from "@/component/layout/NavSearch";
import { UserMenu } from "@/component/layout/UserMenu";
import { MobileDrawer } from "@/component/motion/MobileDrawer";
import {
  easeSmooth,
  staggerContainer,
  staggerItem,
} from "@/component/motion/variants";
import { useAuthModal } from "@/component/providers/AuthModalProvider";
import { useCart } from "@/component/providers/CartProvider";
import { useWishlist } from "@/component/providers/WishlistProvider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// How the category bar's mega menu follows the mouse.
// A category has to be rested on this long before its menu opens, so a mouse
// that is only crossing the bar on its way down the page opens nothing.
const MEGA_OPEN_DELAY_MS = 200;
// With a menu already open, moving to another category switches to its menu
// almost at once — just long enough that cutting across a neighbour on the
// way down into the open menu doesn't switch away from it.
const MEGA_SWITCH_DELAY_MS = 90;
// Leaving the bar and its menu closes the menu after this long; coming back
// within it keeps the menu open.
const MEGA_CLOSE_DELAY_MS = 150;

export interface NavbarUser {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
}

interface NavbarProps {
  dict: Dictionary;
  user: NavbarUser | null;
  brands: Brand[];
}

const Navbar = ({ dict, user, brands }: NavbarProps) => {
  const displayPhone = user?.phone ? formatPhoneDisplay(user.phone) : "";
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openAuth } = useAuthModal();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  // Which category's mega menu is open in the desktop category bar.
  const [megaCategory, setMegaCategory] = useState<string | null>(null);
  // The same, readable at once by the mouse handlers, and the change that is
  // waiting to happen (see the MEGA_… timings).
  const megaCategoryRef = useRef<string | null>(null);
  const megaPendingRef = useRef<{
    timer: ReturnType<typeof setTimeout>;
    category: string | null;
  } | null>(null);

  const cancelMegaChange = useCallback(() => {
    if (megaPendingRef.current) clearTimeout(megaPendingRef.current.timer);
    megaPendingRef.current = null;
  }, []);

  // Opens a category's menu (or closes it, with null) — at once, or after a
  // wait that a later mouse move can still call off.
  const showMega = useCallback(
    (category: string | null, delayMs = 0) => {
      cancelMegaChange();
      const apply = () => {
        megaPendingRef.current = null;
        megaCategoryRef.current = category;
        setMegaCategory(category);
      };
      if (delayMs <= 0) {
        apply();
        return;
      }
      megaPendingRef.current = {
        timer: setTimeout(apply, delayMs),
        category,
      };
    },
    [cancelMegaChange],
  );

  // The mouse came to rest on a category — or is only passing over it; the
  // wait is what tells the two apart.
  const hoverMegaCategory = (category: string) => {
    if (megaCategoryRef.current === category) {
      // Already showing: just call off any close or switch that was coming.
      cancelMegaChange();
      return;
    }
    showMega(
      category,
      megaCategoryRef.current ? MEGA_SWITCH_DELAY_MS : MEGA_OPEN_DELAY_MS,
    );
  };

  // The mouse left a category before its wait was up: it was passing over.
  const leaveMegaCategory = (category: string) => {
    if (megaPendingRef.current?.category === category) cancelMegaChange();
  };

  // Nothing is left waiting once the navbar is gone.
  useEffect(() => cancelMegaChange, [cancelMegaChange]);

  // The category bar is a slider: it scrolls sideways when the categories
  // don't all fit, with an arrow on whichever side has more to show.
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const [stripCanScroll, setStripCanScroll] = useState({
    left: false,
    right: false,
  });

  const updateStripArrows = useCallback(() => {
    const strip = categoryStripRef.current;
    if (!strip) return;
    setStripCanScroll({
      left: strip.scrollLeft > 4,
      right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4,
    });
  }, []);

  // Also re-checks when the bar first appears or the window is resized.
  useEffect(() => {
    const strip = categoryStripRef.current;
    if (!strip) return;
    const observer = new ResizeObserver(updateStripArrows);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [updateStripArrows]);

  const scrollCategoryStrip = (direction: -1 | 1) => {
    const strip = categoryStripRef.current;
    if (!strip) return;
    showMega(null);
    strip.scrollBy({
      left: direction * strip.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  // Keep the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const closeDrawer = () => setMobileOpen(false);

  const collectionLinks = [
    {
      label: dict.nav.new_arrivals,
      href: "/product?collection=new-arrivals",
      icon: Sparkles,
    },
    {
      label: dict.nav.best_sellers,
      href: "/product?collection=best-sellers",
      icon: Star,
    },
  ];

  // The phone menu's main links — only the ones worth a row of their own.
  const drawerLinks = [
    { label: dict.nav.home, href: "/", icon: Home },
    { label: dict.nav.shop, href: "/product", icon: ShoppingBag },
    ...collectionLinks,
    { label: dict.nav.brands, href: "/brands", icon: Tag },
    { label: dict.topbar.track_order, href: "/orders/track", icon: Truck },
  ];

  return (
    <>
    <AnnouncementBar items={dict.topbar.announcements} />

    <header className="sticky top-0 z-40 bg-(--color-primary) shadow-(--shadow-sm)">
      {/* Main row: logo, search, actions. The bar is primary-coloured, so its
          ghost buttons (including the account trigger) go white. */}
      <div className="container flex items-center gap-3 py-3 [&_.btn-ghost]:text-white [&_.btn-ghost:hover]:bg-white/15 [&_.btn-ghost:hover]:text-white">
        <Link
          href="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-85"
          aria-label="Shaajs home"
        >
          <Logo tone="white" className="h-8 sm:h-9" />
        </Link>

        <BrandMenu
          brands={brands}
          label={dict.nav.brands}
          topLabel={dict.nav.top_brands}
          allLabel={dict.nav.all_brands}
          viewAllLabel={dict.nav.view_all_brands}
          searchLabel={dict.nav.search_brands}
          noMatchLabel={dict.nav.brands_no_match}
          className="hidden sm:block"
        />

        <NavSearch
          idPrefix="navbar"
          placeholder={dict.common.search}
          searchLabel={dict.common.search_action}
          className="hidden flex-1 md:block"
        />

        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label={dict.common.search}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="btn-ghost !p-2 rounded md:hidden"
          >
            {mobileSearchOpen ? <X size={22} /> : <Search size={22} />}
          </button>

          {/* Icon + title; the titles need the room of a desktop header. */}
          <Link
            href="/wish-list"
            aria-label={dict.nav.wishlist}
            className="btn-ghost hidden items-center gap-1.5 rounded !p-2 text-sm sm:flex"
          >
            <span className="relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-(--color-primary)">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="hidden lg:inline">{dict.nav.wishlist}</span>
          </Link>

          <Link
            href="/cart"
            aria-label={dict.nav.cart}
            // Phones get the floating cart button instead (MobileQuickActions).
            className="btn-ghost hidden items-center gap-1.5 rounded !p-2 text-sm sm:flex"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-(--color-primary)">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden lg:inline">{dict.nav.cart}</span>
          </Link>

          {user ? (
            <UserMenu
              user={user}
              dict={dict}
              className="hidden sm:block"
            />
          ) : (
            <Link
              href="/sign-in"
              // Opens the sign-in modal over this page instead of leaving it.
              onClick={(event) => {
                event.preventDefault();
                openAuth("sign-in");
              }}
              aria-label={dict.nav.sign_in}
              className="btn-ghost hidden items-center gap-1.5 rounded !p-2 text-sm sm:flex"
            >
              <User size={20} />
              <span className="hidden lg:inline">{dict.nav.sign_in}</span>
            </Link>
          )}

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="btn-ghost !p-2 rounded lg:hidden"
            onClick={() => {
              setMobileSearchOpen(false);
              setMobileOpen(true);
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Phone search — slides down under the header from the search icon. */}
      <AnimatePresence initial={false}>
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeSmooth }}
            className="overflow-hidden border-t border-white/20 md:hidden"
          >
            <NavSearch
              idPrefix="mobile"
              placeholder={dict.common.search}
              searchLabel={dict.common.search_action}
              autoFocus
              inline
              className="container py-3"
              onNavigate={() => setMobileSearchOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category bar — desktop only; phones get the same links in the drawer.
          Resting the mouse on a category, or focusing it, opens its mega menu
          below the bar; a mouse that is only passing over opens nothing. */}
      <nav
        aria-label={dict.nav.categories}
        className="relative hidden border-b border-(--color-border) bg-(--color-surface) lg:block"
        // Coming back before the close has happened calls it off — a slip
        // off the edge of the menu doesn't lose it.
        onMouseEnter={() => {
          if (megaPendingRef.current?.category === null) cancelMegaChange();
        }}
        onMouseLeave={() => showMega(null, MEGA_CLOSE_DELAY_MS)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            showMega(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") showMega(null);
        }}
      >
        <div className="container flex items-center">
          <div className="relative min-w-0 flex-1">
            {stripCanScroll.left && (
              <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex w-16 items-center bg-linear-to-r from-(--color-surface) via-(--color-surface) to-transparent">
                <button
                  type="button"
                  aria-label="Previous categories"
                  onClick={() => scrollCategoryStrip(-1)}
                  className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) p-0 text-(--color-dark) shadow-(--shadow-sm) hover:border-(--color-primary) hover:text-(--color-primary)"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            <div
              ref={categoryStripRef}
              onScroll={updateStripArrows}
              className="flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {navCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  onMouseEnter={() => hoverMegaCategory(category.label)}
                  onMouseLeave={() => leaveMegaCategory(category.label)}
                  // The keyboard gets its menu at once: tabbing onto a
                  // category is never by accident.
                  onFocus={() => showMega(category.label)}
                  onClick={() => showMega(null)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors first:ps-0 hover:text-(--color-primary) ${
                    megaCategory === category.label
                      ? "border-(--color-primary) text-(--color-primary)"
                      : "border-transparent text-(--color-dark)"
                  }`}
                >
                  {category.label}
                </Link>
              ))}
            </div>

            {stripCanScroll.right && (
              <div className="pointer-events-none absolute inset-y-0 end-0 z-10 flex w-16 items-center justify-end bg-linear-to-l from-(--color-surface) via-(--color-surface) to-transparent">
                <button
                  type="button"
                  aria-label="More categories"
                  onClick={() => scrollCategoryStrip(1)}
                  className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) p-0 text-(--color-dark) shadow-(--shadow-sm) hover:border-(--color-primary) hover:text-(--color-primary)"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="ms-3 flex shrink-0 items-center border-s border-(--color-border) ps-1">
            {collectionLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onMouseEnter={() => showMega(null, MEGA_CLOSE_DELAY_MS)}
                className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap text-(--color-dark) transition-colors last:pe-0 hover:text-(--color-primary)"
              >
                <Icon size={15} className="shrink-0 text-(--color-primary)" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {navCategories.map((category) => (
          <MegaMenu
            key={category.href}
            category={category}
            show={megaCategory === category.label}
            onNavigate={() => showMega(null)}
          />
        ))}
      </nav>

      {/* Mobile drawer — opens from the toggle's side. */}
      <MobileDrawer
        show={mobileOpen}
        onClose={closeDrawer}
        side="right"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-(--color-border) px-4 py-3">
          <Link
            href="/"
            onClick={closeDrawer}
            className="flex items-center transition-opacity hover:opacity-85"
            aria-label="Shaajs home"
          >
            <Logo className="h-8" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-bg) p-0 text-(--color-dark) transition-colors hover:bg-(--color-border)"
            onClick={closeDrawer}
          >
            <X className="h-[18px] w-[18px] shrink-0" />
          </button>
        </div>

        {/* Kept short on purpose: the few places people actually go, then
            the departments. Each row is one tap — nothing to fold open. */}
        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        >
          <motion.div variants={staggerItem} className="flex flex-col">
            {drawerLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-(--radius-md) px-2.5 py-3 text-sm font-medium text-(--color-dark) transition-colors active:bg-(--color-bg)"
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-(--color-primary)" />
                {label}
              </Link>
            ))}
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="mt-3 mb-1 border-t border-(--color-border) px-2.5 pt-4 text-xs font-semibold tracking-wider text-(--color-text-light) uppercase"
          >
            {dict.nav.categories}
          </motion.p>

          <motion.div variants={staggerItem} className="flex flex-col">
            {navCategories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-(--radius-md) px-2.5 py-2.5 text-sm text-(--color-dark) transition-colors active:bg-(--color-bg)"
              >
                <category.icon className="h-[18px] w-[18px] shrink-0 text-(--color-text-muted)" />
                <span className="min-w-0 flex-1 truncate">
                  {category.label}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-(--color-text-light)" />
              </Link>
            ))}
          </motion.div>
        </motion.nav>

        {/* Bottom: sign in (or the signed-in account). */}
        <div className="shrink-0 border-t border-(--color-border) bg-(--color-surface) p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-base font-bold text-white">
                    {(user.name?.trim() || user.email || displayPhone || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="mb-0 truncate text-sm font-semibold text-(--color-dark)">
                    {user.name?.trim() || user.email || displayPhone}
                  </p>
                  {(user.email || displayPhone) && (
                    <p className="mb-0 truncate text-xs text-(--color-text-muted)">
                      {user.email || displayPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* A link doesn't get <button>'s built-in flex layout, so it is
                    set here — otherwise the icon drops onto its own line. */}
                {[
                  { href: "/account", label: dict.nav.profile, icon: User },
                  { href: "/orders", label: dict.nav.orders, icon: Package },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeDrawer}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) text-sm font-semibold whitespace-nowrap text-(--color-dark) transition-colors hover:text-(--color-dark) active:bg-(--color-bg)"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-(--color-primary)" />
                    {label}
                  </Link>
                ))}
                <form
                  action={signoutAction}
                  onSubmit={() => {
                    toast.success(dict.nav.signed_out);
                    closeDrawer();
                  }}
                >
                  <button
                    type="submit"
                    aria-label={dict.nav.sign_out}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-0 text-sm font-semibold whitespace-nowrap text-(--color-error) transition-colors active:bg-(--color-bg)"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {dict.nav.sign_out}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <Link
              href="/sign-in"
              onClick={(event) => {
                event.preventDefault();
                closeDrawer();
                openAuth("sign-in");
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-primary) text-sm font-semibold text-white shadow-[0_10px_24px_-8px_var(--color-primary)] transition-transform active:scale-[0.98]"
            >
              <User className="h-[18px] w-[18px] shrink-0" />
              {dict.nav.sign_in}
            </Link>
          )}
        </div>
      </MobileDrawer>
    </header>

    <MobileQuickActions dict={dict} />
    </>
  );
};

export default Navbar;
