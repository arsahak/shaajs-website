import {
  Baby,
  Boxes,
  BriefcaseBusiness,
  DropletOff,
  Droplets,
  Feather,
  Gift,
  Headphones,
  PartyPopper,
  ScanFace,
  Sparkles,
  Watch,
  type LucideIcon,
} from "lucide-react";

// A "shop by need" card: not a category, but who or what a product suits —
// a skin type, an occasion, a kind of buyer. It cuts across every kind of
// product the shop sells (cosmetics, watches, clothing, gadgets, …).
export interface HomeCategory {
  title: string;
  // Placeholder until products can be marked with what they suit (set when a
  // product is uploaded): for now every card opens the full product list.
  href: string;
  // Optional photo, e.g. "/assets/categories/oily-skin.jpg". When it is left
  // out (or fails to load) the card shows its background + icon instead.
  image?: string;
  // Background gradient for the card, top-left → bottom-right.
  colors: [from: string, to: string];
  icon: LucideIcon;
}

const preferenceHref = (slug: string) => `/product?preference=${slug}`;

// The cards on the homepage, in display order — static for now. The grid
// shows six at a time, so keep this a multiple of six to avoid repeats within
// a row; each six mixes skin needs with other kinds of product.
export const homeCategories: HomeCategory[] = [
  {
    title: "Oily Skin",
    href: preferenceHref("oily-skin"),
    colors: ["#ff7aa2", "#d10043"],
    icon: Droplets,
  },
  {
    title: "Acne Care",
    href: preferenceHref("acne-care"),
    colors: ["#ff0052", "#7a0030"],
    icon: ScanFace,
  },
  {
    title: "Dry Skin",
    href: preferenceHref("dry-skin"),
    colors: ["#f59e7a", "#b4375a"],
    icon: DropletOff,
  },
  {
    title: "Combo Offers",
    href: preferenceHref("combo-offers"),
    colors: ["#9d4edd", "#3c096c"],
    icon: Boxes,
  },
  {
    title: "Everyday Watches",
    href: preferenceHref("everyday-watches"),
    colors: ["#5ec4c0", "#1f6f78"],
    icon: Watch,
  },
  {
    title: "Smart Gadgets",
    href: preferenceHref("smart-gadgets"),
    colors: ["#6b7280", "#1d1d1b"],
    icon: Headphones,
  },
  {
    title: "Sensitive Skin",
    href: preferenceHref("sensitive-skin"),
    colors: ["#ff4d86", "#1d1d1b"],
    icon: Feather,
  },
  {
    title: "Glow & Brightening",
    href: preferenceHref("glow-brightening"),
    colors: ["#e0b354", "#8a5a00"],
    icon: Sparkles,
  },
  {
    title: "Party Wear",
    href: preferenceHref("party-wear"),
    colors: ["#b08968", "#5e3a1e"],
    icon: PartyPopper,
  },
  {
    title: "Office Wear",
    href: preferenceHref("office-wear"),
    colors: ["#64748b", "#1e293b"],
    icon: BriefcaseBusiness,
  },
  {
    title: "Mom & Baby",
    href: preferenceHref("mom-baby"),
    colors: ["#f9a8d4", "#db2777"],
    icon: Baby,
  },
  {
    title: "Gift Ideas",
    href: preferenceHref("gift-ideas"),
    colors: ["#ff7aa2", "#ff0052"],
    icon: Gift,
  },
];
