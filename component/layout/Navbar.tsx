"use client";

import { signoutAction } from "@/app/actions/auth";
import type { Brand } from "@/app/actions/brand";
import { navCategories } from "@/app/data/categories";
import { formatPhoneDisplay } from "@/app/data/phone-countries";
import type { Dictionary } from "@/app/dictionaries";
import { Logo } from "@/component/common/Logo";
import { AnnouncementBar } from "@/component/layout/AnnouncementBar";
import { BrandMenu, brandHref } from "@/component/layout/BrandMenu";
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
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
  // Which category is expanded in the mobile drawer (one at a time).
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  // Which category's mega menu is open in the desktop category bar.
  const [megaCategory, setMegaCategory] = useState<string | null>(null);

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
    setMegaCategory(null);
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

  const drawerLinks = [
    ...collectionLinks,
    { label: dict.topbar.track_order, href: "/orders/track", icon: Truck },
    { label: dict.topbar.help_center, href: "/help", icon: HelpCircle },
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
          Hovering or focusing a category opens its mega menu below the bar. */}
      <nav
        aria-label={dict.nav.categories}
        className="relative hidden border-b border-(--color-border) bg-(--color-surface) lg:block"
        onMouseLeave={() => setMegaCategory(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setMegaCategory(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMegaCategory(null);
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
                  onMouseEnter={() => setMegaCategory(category.label)}
                  onFocus={() => setMegaCategory(category.label)}
                  onClick={() => setMegaCategory(null)}
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
                onMouseEnter={() => setMegaCategory(null)}
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
            onNavigate={() => setMegaCategory(null)}
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

        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
        >
          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={closeDrawer}
              className="flex items-center gap-2 rounded-(--radius-lg) bg-(--color-bg) px-3 py-2.5 text-sm font-semibold text-(--color-dark) transition-colors active:bg-(--color-border)"
            >
              <Home className="h-[18px] w-[18px] shrink-0 text-(--color-primary)" />
              {dict.nav.home}
            </Link>
            <Link
              href="/product"
              onClick={closeDrawer}
              className="flex items-center gap-2 rounded-(--radius-lg) bg-(--color-bg) px-3 py-2.5 text-sm font-semibold text-(--color-dark) transition-colors active:bg-(--color-border)"
            >
              <ShoppingBag className="h-[18px] w-[18px] shrink-0 text-(--color-primary)" />
              {dict.nav.shop}
            </Link>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="mt-5 mb-2 px-1 text-xs font-semibold tracking-wider text-(--color-text-light) uppercase"
          >
            {dict.nav.all_categories}
          </motion.p>

          <ul className="flex list-none flex-col gap-1 ps-0">
            {navCategories.map((category) => {
              const isOpen = openCategory === category.label;
              return (
                <motion.li
                  key={category.label}
                  variants={staggerItem}
                  className={`m-0 overflow-hidden rounded-(--radius-lg) border transition-colors duration-300 ${
                    isOpen
                      ? "border-(--color-primary)/25 bg-(--color-primary-faint)"
                      : "border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenCategory(isOpen ? null : category.label)
                    }
                    className="flex w-full items-center gap-3 rounded-(--radius-lg) bg-transparent px-2.5 py-2.5 text-start text-sm font-medium text-(--color-dark)"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isOpen
                          ? "bg-(--color-primary) text-white"
                          : "bg-(--color-bg) text-(--color-primary)"
                      }`}
                    >
                      <category.icon className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {category.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-(--color-text-muted) transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: easeSmooth }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 px-3 pt-1 pb-3">
                          {category.columns.map((column) => (
                            <div key={column.title}>
                              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-(--color-text-muted) uppercase">
                                {column.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {column.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeDrawer}
                                    className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs text-(--color-dark) transition-colors active:border-(--color-primary) active:text-(--color-primary)"
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                          <Link
                            href={category.href}
                            onClick={closeDrawer}
                            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-(--color-primary)"
                          >
                            {dict.common.view_all}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>

          {/* Brands — the header's Brands menu is hidden on phones. */}
          {brands.length > 0 && (
            <motion.div variants={staggerItem}>
              <p className="mt-5 mb-2 px-1 text-xs font-semibold tracking-wider text-(--color-text-light) uppercase">
                {dict.nav.brands}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={brandHref(brand)}
                    onClick={closeDrawer}
                    className="rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs text-(--color-dark) transition-colors active:border-(--color-primary) active:text-(--color-primary)"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={staggerItem}
            className="mt-4 flex flex-col border-t border-(--color-border) pt-3"
          >
            {drawerLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-(--radius-md) px-2.5 py-2.5 text-sm text-(--color-text-muted) transition-colors active:bg-(--color-bg)"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
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
              <div className="grid grid-cols-2 gap-2">
                {/* A link doesn't get <button>'s built-in flex layout, so it is
                    set here — otherwise the icon drops onto its own line. */}
                <Link
                  href="/orders"
                  onClick={closeDrawer}
                  className="flex h-10 items-center justify-center gap-2 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) text-sm font-semibold whitespace-nowrap text-(--color-dark) transition-colors hover:text-(--color-dark) active:bg-(--color-bg)"
                >
                  <Package className="h-4 w-4 shrink-0 text-(--color-primary)" />
                  {dict.nav.orders}
                </Link>
                <form action={signoutAction}>
                  <button
                    type="submit"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-0 text-sm font-semibold whitespace-nowrap text-(--color-error) transition-colors active:bg-(--color-bg)"
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
