// The search-result title and description of every page whose content is
// fixed — one place to read and edit them all. (Product, category and blog
// pages write theirs from the product, category or post itself.)
//
// Titles: the site's name is added after each one ("… | Shaajs"), except the
// home page's. Aim for 50–60 characters in all — longer ones are cut off in
// search results. Descriptions: about 150–160 characters, a plain sentence or
// two saying what the page offers, with the words people search for.

import { pageMetadata, type PageSeo } from "@/app/utils/seo";

type StaticPageSeo = Omit<PageSeo, "path">;

export const STATIC_PAGE_SEO = {
  // ── Shopping ────────────────────────────────────────────────────────────
  "/": {
    title: "Shaajs — Online Beauty, Fashion & Lifestyle Shop in Bangladesh",
    absoluteTitle: true,
    description:
      "Shop authentic makeup, skincare, hair care, fragrance, clothing, watches, shoes and everyday gadgets at Shaajs. Cash on delivery all over Bangladesh.",
  },
  "/product": {
    title: "Shop All Products — Makeup, Skincare, Fashion & Gadgets",
    description:
      "Browse every product at Shaajs: makeup, skincare, hair care, fragrance, clothing, watches, footwear and gadgets. Filter by category, brand and price.",
  },
  "/brands": {
    title: "All Brands — Authentic Beauty & Lifestyle Brands",
    description:
      "Find your favourite brands at Shaajs, A to Z — local and international makeup, skincare, hair care and lifestyle brands, all 100% authentic.",
  },

  // ── About the shop ──────────────────────────────────────────────────────
  "/about": {
    title: "About Us — Online Beauty & Lifestyle Store in Bangladesh",
    description:
      "Shaajs is an online beauty, fashion and lifestyle shop for Bangladesh — authentic products, trusted brands, cash on delivery and delivery to every district.",
  },
  "/contact": {
    title: "Contact Us — Customer Support & Help",
    description:
      "Need help with an order, a delivery or a return? Contact the Shaajs support team by phone, email or message — we are here for you every day.",
  },
  "/careers": {
    title: "Careers — Work With Us",
    description:
      "Join the team building Shaajs, an online beauty, fashion and lifestyle shop for shoppers across Bangladesh. See our open roles and how to apply.",
  },
  "/sell": {
    title: "Sell on Shaajs — Become a Seller",
    description:
      "Reach shoppers all over Bangladesh. Open your shop on Shaajs, list your products and grow your business with easy order handling and fast payouts.",
  },
  "/blog": {
    title: "Blog — Beauty Tips, Shopping Guides & Style Ideas",
    description:
      "Beauty tips, shopping guides, delivery explainers and style ideas from the Shaajs team, to help you buy better and look your best.",
  },

  // ── Help ────────────────────────────────────────────────────────────────
  "/help": {
    title: "Help Center — Orders, Delivery, Payment & Returns",
    description:
      "Answers and guides for shopping at Shaajs: placing an order, paying, tracking a delivery, returning a product and managing your account.",
  },
  "/faq": {
    title: "FAQ — Frequently Asked Questions",
    description:
      "Quick answers to common questions about ordering, payment, cash on delivery, delivery times, returns and refunds at Shaajs.",
  },
  "/shipping": {
    title: "Shipping & Delivery — Charges and Delivery Time",
    description:
      "Delivery charges, delivery times and coverage for Shaajs orders — inside Dhaka and to every district of Bangladesh, with cash on delivery.",
  },
  "/shipping-guide": {
    title: "Shipping Guide — How Delivery Works",
    description:
      "How your Shaajs order travels from our warehouse to your door: packing, courier hand-over, tracking and secure delivery across Bangladesh.",
  },
  "/returns": {
    title: "Returns & Refunds Policy",
    description:
      "How to return a product bought from Shaajs, which items can be returned, and when and how your refund or exchange is made.",
  },
  "/orders/track": {
    title: "Track Your Order",
    description:
      "Enter your order number and phone number or email to see where your Shaajs order is and when it will be delivered.",
  },

  // ── Legal ───────────────────────────────────────────────────────────────
  "/terms": {
    title: "Terms & Conditions",
    description:
      "The terms and conditions for using the Shaajs website and buying from us: orders, prices, payment, delivery, returns and your responsibilities.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How Shaajs collects, uses and protects your personal information when you browse our shop, create an account and place an order.",
  },
  "/cookies": {
    title: "Cookie Policy",
    description:
      "Which cookies the Shaajs website uses, what they are for — keeping you signed in, remembering your cart — and how you can control them.",
  },

  // ── A customer's own pages — kept out of search results ─────────────────
  "/cart": {
    title: "Shopping Cart",
    description: "Review the products in your Shaajs cart and go to checkout.",
    noindex: true,
  },
  "/checkout": {
    title: "Checkout",
    description:
      "Enter your delivery details and place your Shaajs order. Pay with cash on delivery, bKash, Nagad, Rocket or card.",
    noindex: true,
  },
  "/wish-list": {
    title: "My Wishlist",
    description: "The products you have saved to your Shaajs wishlist.",
    noindex: true,
  },
  "/orders": {
    title: "My Orders",
    description: "Your Shaajs orders and where each one is.",
    noindex: true,
  },
  "/account": {
    title: "My Profile",
    description: "Your Shaajs account: your details and delivery address.",
    noindex: true,
  },
  "/account/edit": {
    title: "Edit Profile",
    description: "Update your name, contact details and delivery address.",
    noindex: true,
  },
  "/account/settings": {
    title: "Account Settings",
    description: "Manage your Shaajs account settings.",
    noindex: true,
  },
} satisfies Record<string, StaticPageSeo>;

export type StaticPagePath = keyof typeof STATIC_PAGE_SEO;

/** The metadata of a fixed page, from the list above. */
export const staticPageMetadata = (path: StaticPagePath) =>
  pageMetadata({ ...STATIC_PAGE_SEO[path], path });

// The collections the product list can be opened on (/product?collection=…).
export const COLLECTION_SEO: Record<
  string,
  { title: string; description: string }
> = {
  "new-arrivals": {
    title: "New Arrivals — Latest Beauty & Fashion Products",
    description:
      "The newest makeup, skincare, fashion and lifestyle products just added at Shaajs. Be the first to try them, with cash on delivery across Bangladesh.",
  },
  "best-sellers": {
    title: "Best Sellers — Most Loved Products",
    description:
      "The products Shaajs shoppers love most: best-selling makeup, skincare, hair care and lifestyle picks, all authentic, with cash on delivery.",
  },
  "top-selling": {
    title: "Top Selling Products — Trending Now",
    description:
      "What is trending at Shaajs right now: the top-selling beauty, fashion and lifestyle products, delivered all over Bangladesh.",
  },
  "free-delivery": {
    title: "Free Delivery Products",
    description:
      "Products that ship free at Shaajs — authentic beauty, fashion and lifestyle picks with no delivery charge, anywhere in Bangladesh.",
  },
};
