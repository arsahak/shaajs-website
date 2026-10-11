import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getDictionary } from "@/app/dictionaries";
import { getMyProfile } from "@/app/actions/user";
import CheckoutDetails from "@/component/checkout/CheckoutDetails";

export default async function CheckoutPage() {
  const dict = await getDictionary();

  // Checkout is open to everyone. A signed-in customer gets their saved
  // details filled in; anyone else types them and is verified by a one-time
  // code when they place the order.
  const session = await auth();
  const profile = session?.user ? await getMyProfile() : null;
  // An account made by signing in with a code has no real name yet (the
  // backend's placeholder) — the form then starts with the name blank.
  const nameOf = (name?: string | null) =>
    name && name.trim() !== "Customer" ? name.trim() : "";

  return (
    <div className="container py-8">
      {/* Checkout page hero */}
      <div className="relative overflow-hidden rounded-(--radius-2xl) bg-linear-to-br from-(--color-primary) to-(--color-primary-light) px-6 py-5 sm:px-8 sm:py-6">
        <div className="relative z-10">
          <h1 className="text-white">{dict.checkoutPage.title}</h1>
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
            <Link
              href="/cart"
              className="text-white/70 transition-colors hover:text-white"
            >
              {dict.cart.title}
            </Link>
            <ChevronRight size={12} />
            <span>{dict.checkoutPage.title}</span>
          </nav>
        </div>

        <Package
          aria-hidden="true"
          strokeWidth={1}
          size={110}
          className="pointer-events-none absolute end-[-1rem] bottom-[-1rem] text-white/15"
        />
      </div>

      <div className="mt-6">
        <CheckoutDetails
          dict={dict}
          // A saved session the backend no longer accepts counts as a guest.
          isSignedIn={Boolean(profile?.ok)}
          initialUser={
            profile?.ok
              ? {
                  name: nameOf(
                    [profile.data.firstName, profile.data.lastName]
                      .filter(Boolean)
                      .join(" ") || session?.user.name,
                  ),
                  email: profile.data.email ?? session?.user.email,
                  phone: profile.data.phone,
                  address: profile.data.address?.area,
                  zone: profile.data.address?.zone,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
