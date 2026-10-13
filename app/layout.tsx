import { CartProvider } from "@/component/providers/CartProvider";
import { ThemeProvider } from "@/component/providers/ThemeProvider";
import { ThemeScript } from "@/component/providers/ThemeScript";
import { ToastProvider } from "@/component/providers/ToastProvider";
import { WishlistProvider } from "@/component/providers/WishlistProvider";
import type { Metadata } from "next";
import { DM_Sans, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { JsonLd } from "@/component/seo/JsonLd";
import { getDictionary } from "./dictionaries";
import {
  DEFAULT_SHARE_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./utils/seo";
import "./globals.css";

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

// The defaults every page starts from. Each page then describes itself with
// pageMetadata() (app/utils/seo.ts) — its own title, description, canonical
// address and share tags. There is deliberately no canonical here: one set on
// the layout would be inherited by any page that set none of its own, telling
// search engines that page is a copy of the home page.
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: dict.meta.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: dict.meta.description,
    category: "shopping",
    creator: SITE_NAME,
    publisher: SITE_NAME,
    // Phone numbers and addresses in the text are not turned into links.
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: "website",
      url: "/",
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      // Search results may show a full snippet and a large picture.
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the code Google Search
    // Console gives, to prove the site is yours.
    ...(googleVerification
      ? { verification: { google: googleVerification } }
      : {}),
  };
}

// Who runs the site, and how to search it — read by search engines to label
// the site in results and offer a search box under its listing.
const SITE_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/assets/logo/color-logo.svg"),
      description:
        "Online beauty, fashion and lifestyle shop in Bangladesh — makeup, skincare, clothing, watches, footwear and gadgets, with cash on delivery.",
      areaServed: { "@type": "Country", name: "Bangladesh" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/product?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

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
      className={`${jakarta.variable} ${inter.variable} ${dmSans.variable} h-full antialiased`}
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
        <JsonLd data={SITE_STRUCTURED_DATA} />
      </body>
    </html>
  );
}
