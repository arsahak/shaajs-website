import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/utils/seo";

// What search engines may crawl. Everything public is open; a customer's own
// pages — cart, checkout, account, orders, wishlist, sign-in — are left out,
// since there is nothing in them to list in a search result.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/cart",
          "/checkout",
          "/customer-profile",
          "/orders",
          "/wish-list",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
