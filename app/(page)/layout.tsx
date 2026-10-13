import Topbar from "@/component/layout/Topbar";
import Navbar, { type NavbarUser } from "@/component/layout/Navbar";
import Footer from "@/component/layout/Footer";
import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/auth";
import { listBrandsAction } from "@/app/actions/brand";
import { AuthModalProvider } from "@/component/providers/AuthModalProvider";
import { getMyProfile } from "@/app/actions/user";
import { NavigationProgress } from "@/component/layout/NavigationProgress";
import { Suspense } from "react";

// The header's "Brands" menu shows the top brands picked in the dashboard
// (the full list lives on /brands — far too long to send with every page).
// Until some are picked, the first few brands stand in so it isn't empty.
const HEADER_BRAND_LIMIT = 12;

async function loadHeaderBrands() {
  const activeBrands = async (top: boolean) => {
    const res = await listBrandsAction({ top });
    return (res.ok && res.data ? res.data : []).filter((b) => b.isActive);
  };
  const top = await activeBrands(true);
  return top.length > 0
    ? top
    : (await activeBrands(false)).slice(0, HEADER_BRAND_LIMIT);
}

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The header's brands are asked for straight away, so they load while the
  // sign-in is being checked instead of after it.
  const brandsPromise = loadHeaderBrands();
  const [dict, session] = await Promise.all([getDictionary(), auth()]);

  // Navbar needs the freshest avatar/name — the session cookie only carries
  // what was true at sign-in, so re-fetch the live profile instead of
  // trusting a token that could be stale (e.g. after an avatar change).
  let navbarUser: NavbarUser | null = null;
  // An account made by signing in with a code is called "Customer" until it
  // has a real name — the menu then shows the email or phone instead.
  const realName = (name?: string | null) =>
    name && name.trim() !== "Customer" ? name : null;
  if (session?.user) {
    const profile = await getMyProfile();
    navbarUser = profile.ok
      ? {
          name: realName(
            [profile.data.firstName, profile.data.lastName]
              .filter(Boolean)
              .join(" ") || session.user.name,
          ),
          email: profile.data.email ?? session.user.email,
          phone: profile.data.phone ?? null,
          image: profile.data.avatar ?? null,
        }
      : {
          name: realName(session.user.name),
          email: session.user.email,
          phone: null,
          image: null,
        };
  }

  const brands = await brandsPromise;

  return (
    // Sign-in opens as a modal over whichever page the visitor is on.
    <AuthModalProvider dict={dict}>
      {/* (In Suspense: it reads the address's query string.) */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {/* <Topbar dict={dict} /> */}
      <Navbar dict={dict} user={navbarUser} brands={brands} />
      {children}
      <Footer dict={dict} />
    </AuthModalProvider>
  );
}
