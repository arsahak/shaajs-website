import {
  Baby,
  Bath,
  Brush,
  Droplets,
  Footprints,
  Gem,
  Gift,
  Handbag,
  Palette,
  Scissors,
  Shirt,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

export interface HomeCategory {
  title: string;
  // Same links as the main navigation (app/data/categories.ts).
  href: string;
  // Optional photo, e.g. "/assets/categories/skincare.jpg". When it is left
  // out (or fails to load) the card shows its background + icon instead.
  image?: string;
  // Background gradient for the card, top-left → bottom-right.
  colors: [from: string, to: string];
  icon: LucideIcon;
}

// The category cards on the homepage, in display order. The grid shows six at
// a time, so keep this a multiple of six to avoid repeats within a row.
export const homeCategories: HomeCategory[] = [
  {
    title: "Skin Care",
    href: "/category/skincare",
    colors: ["#ff7aa2", "#d10043"],
    icon: Droplets,
  },
  {
    title: "Makeup",
    href: "/category/makeup",
    colors: ["#ff0052", "#7a0030"],
    icon: Palette,
  },
  {
    title: "Hair Care",
    href: "/category/hair-care",
    colors: ["#f59e7a", "#b4375a"],
    icon: Scissors,
  },
  {
    title: "Fragrance",
    href: "/category/fragrance",
    colors: ["#9d4edd", "#3c096c"],
    icon: SprayCan,
  },
  {
    title: "Bath & Body",
    href: "/category/bath-body",
    colors: ["#5ec4c0", "#1f6f78"],
    icon: Bath,
  },
  {
    title: "Tools & Accessories",
    href: "/category/tools-accessories",
    colors: ["#6b7280", "#1d1d1b"],
    icon: Brush,
  },
  {
    title: "Clothing",
    href: "/category/clothing",
    colors: ["#ff4d86", "#1d1d1b"],
    icon: Shirt,
  },
  {
    title: "Jewelry",
    href: "/category/jewelry",
    colors: ["#e0b354", "#8a5a00"],
    icon: Gem,
  },
  {
    title: "Bags",
    href: "/category/bags",
    colors: ["#b08968", "#5e3a1e"],
    icon: Handbag,
  },
  {
    title: "Footwear",
    href: "/category/footwear",
    colors: ["#64748b", "#1e293b"],
    icon: Footprints,
  },
  {
    title: "Mom & Baby",
    href: "/category/mom-baby",
    colors: ["#f9a8d4", "#db2777"],
    icon: Baby,
  },
  {
    title: "Gift Sets",
    href: "/category/gift-sets",
    colors: ["#ff7aa2", "#ff0052"],
    icon: Gift,
  },
];
