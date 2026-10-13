// Everything a page needs to describe itself to search engines and to the
// apps that draw a preview card when its link is shared.
//
// Every page builds its metadata with pageMetadata(). That matters because
// Next.js merges a page's metadata over the root layout's key by key: a page
// that set only a title would keep the home page's Open Graph block — its
// title, description and address — and every shared link would preview as
// the home page. pageMetadata() fills in all of it for the page itself.

import type { Metadata } from "next";

export const SITE_NAME = "Shaajs";

/**
 * The address this site is reached at — what canonical links, the sitemap and
 * social-share tags are built from. In order:
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

export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");

/** A path on this site as a full address ("/about" → "https://…/about"). */
export const absoluteUrl = (path = "/"): string =>
  new URL(path, `${SITE_URL}/`).toString();

/** The picture a shared link shows when the page has none of its own. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Shaajs — Beauty, Style & Lifestyle",
};

// Search results show roughly this much of a description; anything past it
// is cut off mid-word by the search engine.
const DESCRIPTION_LENGTH = 160;

/**
 * A description tidied for a search result: one line, and no longer than a
 * result shows — cut at a word, with an ellipsis, when it has to be.
 */
export function metaDescription(text: string): string {
  const line = text.replace(/\s+/g, " ").trim();
  if (line.length <= DESCRIPTION_LENGTH) return line;
  const cut = line.slice(0, DESCRIPTION_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[\s,;:.–—-]+$/, "")}…`;
}

export interface PageSeo {
  /**
   * The page's title. The site's name is added after it ("… | Shaajs")
   * unless `absoluteTitle` is set.
   */
  title: string;
  description: string;
  /** The page's own address, from the site root: "/about". */
  path: string;
  /** Use the title exactly as written — for the home page. */
  absoluteTitle?: boolean;
  /**
   * Keep the page out of search results: a customer's own pages (cart,
   * account, orders) and pages that only repeat others (search results).
   */
  noindex?: boolean;
  /** The picture for a shared link; the site's default when left out. */
  image?: { url: string; alt?: string; width?: number; height?: number };
  /** "article" for something written and dated, like a blog post. */
  type?: "website" | "article";
  /** For an article: when it was published (ISO date). */
  publishedTime?: string;
}

/**
 * A page's full metadata: its title and description, its canonical address,
 * whether search engines may list it, and the matching Open Graph and
 * Twitter tags for link previews.
 */
export function pageMetadata(seo: PageSeo): Metadata {
  const description = metaDescription(seo.description);
  const shareTitle = seo.absoluteTitle
    ? seo.title
    : `${seo.title} | ${SITE_NAME}`;
  const image = seo.image ?? DEFAULT_SHARE_IMAGE;

  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description,
    alternates: { canonical: seo.path },
    robots: seo.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: seo.type ?? "website",
      url: seo.path,
      title: shareTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [image],
      ...(seo.type === "article" && seo.publishedTime
        ? { publishedTime: seo.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [image.url],
    },
  };
}
