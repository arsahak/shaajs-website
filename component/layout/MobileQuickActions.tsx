"use client";

import type { Dictionary } from "@/app/dictionaries";
import { easeSmooth } from "@/component/motion/variants";
import { useCart } from "@/component/providers/CartProvider";
import { useWishlist } from "@/component/providers/WishlistProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileQuickActionsProps {
  dict: Dictionary;
}

// Pages that already *are* the cart / wishlist — the shortcuts would only
// cover their own content there.
const HIDDEN_ON = ["/cart", "/wish-list"];

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-secondary) px-1 text-[10px] leading-none font-bold text-(--color-secondary-foreground) ring-2 ring-(--color-surface)"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/**
 * Wishlist + cart shortcuts pinned to the bottom corner on phones, where the
 * header only has room for the logo, search and menu toggle.
 */
export function MobileQuickActions({ dict }: MobileQuickActionsProps) {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const path = usePathname() ?? "/";

  const hidden = HIDDEN_ON.some(
    (page) => path === page || path.startsWith(`${page}/`),
  );

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: easeSmooth }}
          // Sits above the phone's home indicator / browser bar.
          className="fixed end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-3 sm:hidden"
        >
          <motion.div whileTap={{ scale: 0.9 }}>
            <Link
              href="/wish-list"
              aria-label={
                wishlistCount > 0
                  ? `${dict.nav.wishlist} (${wishlistCount})`
                  : dict.nav.wishlist
              }
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-pink-500 shadow-[0_8px_24px_-6px_rgb(0_0_0_/_0.25)]"
            >
              <Heart
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 ${wishlistCount > 0 ? "fill-pink-500" : ""}`}
              />
              <CountBadge count={wishlistCount} />
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Link
              href="/cart"
              aria-label={
                cartCount > 0 ? `${dict.nav.cart} (${cartCount})` : dict.nav.cart
              }
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-(--color-primary) text-white shadow-[0_10px_28px_-6px_var(--color-primary)]"
            >
              <ShoppingCart aria-hidden="true" className="h-6 w-6 shrink-0" />
              <CountBadge count={cartCount} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileQuickActions;
