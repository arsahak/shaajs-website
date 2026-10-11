import {
  Banknote,
  ShieldCheck,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { formatTaka, insideDhaka, outsideDhaka } from "./delivery";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readMinutes: number;
  icon: LucideIcon;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-delivery-works",
    title: "How Delivery Works on Shaajs",
    excerpt:
      "From the confirmation call to the knock on your door — a plain-language look at the journey your parcel takes across Bangladesh.",
    category: "Delivery",
    date: "2026-10-01",
    readMinutes: 4,
    icon: Truck,
    sections: [
      {
        heading: "It starts with a confirmation",
        paragraphs: [
          "After you place an order we get in touch to confirm the items and your delivery address. A quick check at this stage saves a failed delivery later, so keep your phone within reach.",
        ],
      },
      {
        heading: "Two zones, two flat fees",
        paragraphs: [
          "Delivery is priced by zone, and you see the fee in the order summary before you confirm.",
        ],
        bullets: [
          `Inside Dhaka: ${formatTaka(insideDhaka.fee)}, usually ${insideDhaka.days} working days.`,
          `Outside Dhaka: ${formatTaka(outsideDhaka.fee)}, usually ${outsideDhaka.days} working days.`,
        ],
      },
      {
        heading: "The last mile",
        paragraphs: [
          "Once your order is packed, our delivery partner carries it to your area and the rider calls before arriving. Check that the parcel is sealed and the order number matches, then pay in cash.",
          "You can follow each stage — pending, processing, shipped and delivered — from the Track Order page.",
        ],
      },
    ],
  },
  {
    slug: "smart-online-shopping-checklist",
    title: "A Smart Shopper's Checklist Before You Buy",
    excerpt:
      "Seven quick checks that take a minute and save you from the most common online shopping regrets.",
    category: "Shopping Guide",
    date: "2026-09-24",
    readMinutes: 5,
    icon: ShieldCheck,
    sections: [
      {
        heading: "Read the listing, not just the photo",
        paragraphs: [
          "Photos sell the product, but the specifications tell you what you are actually getting. Check dimensions, materials, what is in the box and which variation the price applies to.",
        ],
      },
      {
        heading: "The one-minute checklist",
        paragraphs: ["Before adding to cart, run through these:"],
        bullets: [
          "Is the size, colour or model the one you want?",
          "Does the price match the variation you selected?",
          "Have you read recent reviews, not only the top ones?",
          "Do you know the delivery estimate for your area?",
          "Is the delivery fee shown in the order summary acceptable?",
          "Do you understand the return window for this item?",
          "Is your delivery address and phone number up to date?",
        ],
      },
      {
        heading: "Keep your order number",
        paragraphs: [
          "Once you order, note the order number. It is the fastest way to track the parcel and the first thing support will ask for if anything needs sorting out.",
        ],
      },
    ],
  },
  {
    slug: "start-selling-on-Shaajs",
    title: "Getting Started as a Seller on Shaajs",
    excerpt:
      "What we look for in new sellers, how the application works and how to prepare listings that convert.",
    category: "Sellers",
    date: "2026-09-15",
    readMinutes: 4,
    icon: Store,
    sections: [
      {
        heading: "Who we are looking for",
        paragraphs: [
          "We welcome manufacturers, wholesalers and brand owners with genuine products and reliable stock. Every seller is reviewed before going live — that review is what lets shoppers buy with confidence.",
        ],
      },
      {
        heading: "Preparing a strong listing",
        paragraphs: [
          "Good listings answer questions before they are asked. Sellers who do this well see fewer returns and better reviews.",
        ],
        bullets: [
          "Use clear photos on a plain background, including every colour you offer.",
          "State exact sizes, materials and package contents.",
          "Keep stock levels accurate so orders are never cancelled.",
          "Price each variation honestly — no surprises at checkout.",
        ],
      },
      {
        heading: "Applying",
        paragraphs: [
          "Head to the Sell on Shaajs page and send us your business details. Our seller team will get back to you and walk you through setting up your store.",
        ],
      },
    ],
  },
  {
    slug: "cash-on-delivery-explained",
    title: "Cash on Delivery, Explained",
    excerpt:
      "How paying at your door works, what to have ready when the courier arrives and what to do if something is wrong.",
    category: "Payments",
    date: "2026-09-05",
    readMinutes: 3,
    icon: Banknote,
    sections: [
      {
        heading: "Pay when it arrives",
        paragraphs: [
          "With Cash on Delivery you do not pay anything when you place the order. The full amount — products plus the delivery fee shown at checkout — is paid to the courier when the parcel reaches you.",
        ],
      },
      {
        heading: "Be ready for the delivery",
        paragraphs: ["A smooth handover comes down to three things:"],
        bullets: [
          "Keep your phone on — the courier may call before arriving.",
          "Have the exact order total ready.",
          "Check that the parcel is sealed and the order number matches.",
        ],
      },
      {
        heading: "If something is not right",
        paragraphs: [
          "If the item is damaged or not what you ordered, contact support within 48 hours with photos. Our Returns & Refunds page explains the options in full.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
