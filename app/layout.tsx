import { CartProvider } from "@/component/providers/CartProvider";
import { ThemeProvider } from "@/component/providers/ThemeProvider";
import { ThemeScript } from "@/component/providers/ThemeScript";
import { ToastProvider } from "@/component/providers/ToastProvider";
import { WishlistProvider } from "@/component/providers/WishlistProvider";
import type { Metadata } from "next";
import { Audiowide, DM_Sans, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getDictionary } from "./dictionaries";
import "./globals.css";

/**
 * The address this site is reached at — what canonical links and social-share
 * tags (og:url, og:image) are built from. In order:
 *
 * 1. NEXT_PUBLIC_SITE_URL, when it is set to a real address.
 * 2. On Vercel, the project's own domain: https://shaajs-website.vercel.app
 *    today, and the custom domain automatically once one is connected.
 * 3. https://www.shaajs.com.
 *
 * A localhost value is ignored on Vercel: left over from a local .env, it
 * would make every shared link point its picture at the visitor's own machine.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const onVercel = Boolean(process.env.VERCEL);
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(
    configured ?? "",
  );
  if (configured && !(onVercel && isLocal)) return configured;

  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelDomain) return `https://${vercelDomain}`;

  return "https://www.shaajs.com";
}

const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");
const SITE_NAME = "Shaajs";
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// The SHAAJS wordmark (component/common/Logo.tsx). Audiowide ships one weight.
const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const canonicalUrl = new URL("/", SITE_URL).toString();
  // X/Twitter shows the same picture as everywhere else.
  const socialImageUrl = new URL("/opengraph-image.png", SITE_URL).toString();

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: dict.meta.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: SITE_NAME,
      locale: "en_US",
      // The picture itself is app/opengraph-image.png (with its alt text
      // beside it) — Next.js adds the og:image tags for that file on its own.
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [socialImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // globals.css sets `scroll-behavior: smooth`; this tells Next to switch
      // it off while changing page, so a new page opens at the very top
      // instead of sliding its heading under the sticky navbar.
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${inter.variable} ${dmSans.variable} ${audiowide.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
