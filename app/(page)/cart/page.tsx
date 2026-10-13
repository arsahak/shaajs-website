import { ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/app/dictionaries";
import CartDetaits from "@/component/addtocart/CartDetaits";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/cart");

export default async function CartPage() {
  const dict = await getDictionary();

  return (
    <div className="container py-8">
      {/* Cart page hero */}
      <div className="relative overflow-hidden rounded-(--radius-2xl) bg-linear-to-br from-(--color-primary) to-(--color-primary-light) px-6 py-5 sm:px-8 sm:py-6">
        <div className="relative z-10">
          <h1 className="text-white">{dict.cart.title}</h1>
          <nav
            aria-label="Breadcrumb"
            className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70"
          >
            <Link
              href="/"
              className="text-white/70 transition-colors hover:text-white"
            >
              {dict.nav.home}
            </Link>
            <ChevronRight size={12} />
            <span>{dict.cart.title}</span>
          </nav>
        </div>

        <ShoppingCart
          aria-hidden="true"
          strokeWidth={1}
          size={110}
          className="pointer-events-none absolute end-[-1rem] bottom-[-1rem] text-white/15"
        />
      </div>

      <div className="mt-6">
        <CartDetaits dict={dict} />
      </div>
    </div>
  );
}
