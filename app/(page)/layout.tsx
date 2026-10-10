import Topbar from "@/component/layout/Topbar";
import Navbar, { type NavbarUser } from "@/component/layout/Navbar";
import Footer from "@/component/layout/Footer";
import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/auth";
import { listBrandsAction } from "@/app/actions/brand";
import { AuthModalProvider } from "@/component/providers/AuthModalProvider";
import { getMyProfile } from "@/app/actions/user";

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const session = await auth();

  // Navbar needs the freshest avatar/name — the session cookie only carries
  // what was true at sign-in, so re-fetch the live profile instead of
  // trusting a token that could be stale (e.g. after an avatar change).
  let navbarUser: NavbarUser | null = null;
  if (session?.user) {
    const profile = await getMyProfile();
    navbarUser = profile.ok
      ? {
          name:
            [profile.data.firstName, profile.data.lastName]
              .filter(Boolean)
              .join(" ") || session.user.name,
          email: profile.data.email ?? session.user.email,
          phone: profile.data.phone ?? null,
          image: profile.data.avatar ?? null,
        }
      : {
          name: session.user.name,
          email: session.user.email,
          phone: null,
          image: null,
        };
  }

  // The header's "Brands" menu — only the brands switched on in the dashboard.
  const brandsRes = await listBrandsAction();
  const brands = (brandsRes.ok && brandsRes.data ? brandsRes.data : []).filter(
    (brand) => brand.isActive,
  );

  return (
    // Sign-in opens as a modal over whichever page the visitor is on.
    <AuthModalProvider dict={dict}>
      {/* <Topbar dict={dict} /> */}
      <Navbar dict={dict} user={navbarUser} brands={brands} />
      {children}
      <Footer dict={dict} />
    </AuthModalProvider>
  );
}
