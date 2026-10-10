import { CartProvider } from "@/component/providers/CartProvider";
import { ThemeProvider } from "@/component/providers/ThemeProvider";
import { ThemeScript } from "@/component/providers/ThemeScript";
import { ToastProvider } from "@/component/providers/ToastProvider";
import { WishlistProvider } from "@/component/providers/WishlistProvider";
import type { Metadata } from "next";
import { Audiowide, DM_Sans, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getDictionary } from "./dictionaries";
import "./globals.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.shaajs.com"
).replace(/\/+$/, "");
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
