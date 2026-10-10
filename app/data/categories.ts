import {
  Baby,
  Bath,
  Brush,
  Droplets,
  Footprints,
  Gem,
  Gift,
  Handbag,
  HeartPulse,
  Palette,
  Plug,
  Scissors,
  Shirt,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

export interface MegaMenuLink {
  label: string;
  href: string;
  badge?: "new" | "hot" | "sale";
}

export interface MegaMenuColumn {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuPromo {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

export interface NavCategory {
  label: string;
  href: string;
  icon: LucideIcon;
  columns: MegaMenuColumn[];
  promo: MegaMenuPromo;
}

// A category page shows only its own products when the dashboard has a
// category whose slug matches the last part of the link (e.g. "lipstick").
export const navCategories: NavCategory[] = [
  {
    label: "Makeup",
    href: "/category/makeup",
    icon: Palette,
    columns: [
      {
        title: "Face",
        links: [
          { label: "Foundation", href: "/category/makeup/foundation" },
          { label: "BB & CC Cream", href: "/category/makeup/bb-cc-cream" },
          { label: "Concealer", href: "/category/makeup/concealer" },
          { label: "Primer", href: "/category/makeup/primer" },
          { label: "Face Powder", href: "/category/makeup/face-powder" },
          { label: "Blush", href: "/category/makeup/blush" },
          { label: "Highlighter", href: "/category/makeup/highlighter" },
          { label: "Bronzer & Contour", href: "/category/makeup/bronzer-contour" },
          { label: "Setting Spray", href: "/category/makeup/setting-spray" },
        ],
      },
      {
        title: "Eyes",
        links: [
          { label: "Kajal", href: "/category/makeup/kajal" },
          { label: "Eyeliner", href: "/category/makeup/eyeliner" },
          { label: "Mascara", href: "/category/makeup/mascara" },
          { label: "Eyeshadow", href: "/category/makeup/eyeshadow" },
          { label: "Eyeshadow Palettes", href: "/category/makeup/eyeshadow-palettes" },
          { label: "Eyebrow", href: "/category/makeup/eyebrow" },
          { label: "False Eyelashes", href: "/category/makeup/false-eyelashes" },
          { label: "Eye Primer", href: "/category/makeup/eye-primer" },
        ],
      },
      {
        title: "Lips",
        links: [
          { label: "Lipstick", href: "/category/makeup/lipstick" },
          { label: "Liquid Lipstick", href: "/category/makeup/liquid-lipstick" },
          { label: "Lip Gloss", href: "/category/makeup/lip-gloss" },
          { label: "Lip Tint", href: "/category/makeup/lip-tint" },
          { label: "Lip Liner", href: "/category/makeup/lip-liner" },
          { label: "Lip Crayon", href: "/category/makeup/lip-crayon" },
          { label: "Lip Balm", href: "/category/makeup/lip-balm" },
        ],
      },
      {
        title: "Nails",
        links: [
          { label: "Nail Polish", href: "/category/makeup/nail-polish" },
          { label: "Gel Nail Polish", href: "/category/makeup/gel-nail-polish" },
          { label: "Nail Art", href: "/category/makeup/nail-art" },
          { label: "Artificial Nails", href: "/category/makeup/artificial-nails" },
          { label: "Nail Care", href: "/category/makeup/nail-care" },
          { label: "Nail Polish Remover", href: "/category/makeup/nail-polish-remover" },
        ],
      },
      {
        title: "Sets & Palettes",
        links: [
          { label: "Makeup Kits", href: "/category/makeup/makeup-kits" },
          { label: "Face Palettes", href: "/category/makeup/face-palettes" },
          { label: "Bridal Makeup", href: "/category/makeup/bridal-makeup" },
          { label: "Makeup Gift Sets", href: "/category/makeup/makeup-gift-sets" },
          { label: "Travel Size", href: "/category/makeup/travel-size-makeup" },
        ],
      },
    ],
    promo: {
      title: "Shades for every look",
      subtitle: "Face, eyes, lips and nails — everything for your daily routine.",
      cta: "Shop Makeup",
      href: "/category/makeup",
    },
  },
  {
    label: "Skincare",
    href: "/category/skincare",
    icon: Droplets,
    columns: [
      {
        title: "Cleansers",
        links: [
          { label: "Face Wash", href: "/category/skincare/face-wash" },
          { label: "Cleanser", href: "/category/skincare/cleanser" },
          { label: "Cleansing Oil & Balm", href: "/category/skincare/cleansing-oil-balm" },
          { label: "Micellar Water", href: "/category/skincare/micellar-water" },
          { label: "Makeup Remover", href: "/category/skincare/makeup-remover" },
          { label: "Scrub & Exfoliator", href: "/category/skincare/scrub-exfoliator" },
        ],
      },
      {
        title: "Serums & Treatments",
        links: [
          { label: "Face Serum", href: "/category/skincare/face-serum" },
          { label: "Vitamin C", href: "/category/skincare/vitamin-c" },
          { label: "Niacinamide", href: "/category/skincare/niacinamide" },
          { label: "Hyaluronic Acid", href: "/category/skincare/hyaluronic-acid" },
          { label: "Retinol", href: "/category/skincare/retinol" },
          { label: "Spot Treatment", href: "/category/skincare/spot-treatment" },
          { label: "Face Oil", href: "/category/skincare/face-oil" },
        ],
      },
      {
        title: "Moisturizers",
        links: [
          { label: "Moisturizer", href: "/category/skincare/moisturizer" },
          { label: "Day Cream", href: "/category/skincare/day-cream" },
          { label: "Night Cream", href: "/category/skincare/night-cream" },
          { label: "Gel Cream", href: "/category/skincare/gel-cream" },
          { label: "Face Lotion", href: "/category/skincare/face-lotion" },
        ],
      },
      {
        title: "Shop by Concern",
        links: [
          { label: "Acne & Blemishes", href: "/category/skincare/acne-blemishes" },
          { label: "Brightening", href: "/category/skincare/brightening" },
          { label: "Dark Spots", href: "/category/skincare/dark-spots" },
          { label: "Dry Skin", href: "/category/skincare/dry-skin" },
          { label: "Oily Skin", href: "/category/skincare/oily-skin" },
          { label: "Sensitive Skin", href: "/category/skincare/sensitive-skin" },
          { label: "Anti-Aging", href: "/category/skincare/anti-aging" },
          { label: "Pores", href: "/category/skincare/pores" },
          { label: "Dark Circles", href: "/category/skincare/dark-circles" },
        ],
      },
      {
        title: "Toners & Mists",
        links: [
          { label: "Toner", href: "/category/skincare/toner" },
          { label: "Essence", href: "/category/skincare/essence" },
          { label: "Face Mist", href: "/category/skincare/face-mist" },
        ],
      },
      {
        title: "Masks",
        links: [
          { label: "Sheet Mask", href: "/category/skincare/sheet-mask" },
          { label: "Clay Mask", href: "/category/skincare/clay-mask" },
          { label: "Peel-Off Mask", href: "/category/skincare/peel-off-mask" },
          { label: "Sleeping Mask", href: "/category/skincare/sleeping-mask" },
        ],
      },
      {
        title: "Sun Care",
        links: [
          { label: "Sunscreen", href: "/category/skincare/sunscreen" },
          { label: "Tinted Sunscreen", href: "/category/skincare/tinted-sunscreen" },
          { label: "After-Sun Care", href: "/category/skincare/after-sun-care" },
        ],
      },
      {
        title: "Eye & Lip Care",
        links: [
          { label: "Eye Cream", href: "/category/skincare/eye-cream" },
          { label: "Eye Serum", href: "/category/skincare/eye-serum" },
          { label: "Under-Eye Patches", href: "/category/skincare/under-eye-patches" },
          { label: "Lip Scrub", href: "/category/skincare/lip-scrub" },
          { label: "Lip Mask", href: "/category/skincare/lip-mask" },
        ],
      },
    ],
    promo: {
      title: "Care for every skin type",
      subtitle: "Cleanse, treat, moisturize and protect.",
      cta: "Shop Skincare",
      href: "/category/skincare",
    },
  },
  {
    label: "Hair Care",
    href: "/category/hair-care",
    icon: Scissors,
    columns: [
      {
        title: "Wash & Care",
        links: [
          { label: "Shampoo", href: "/category/hair-care/shampoo" },
          { label: "Conditioner", href: "/category/hair-care/conditioner" },
          { label: "Hair Mask", href: "/category/hair-care/hair-mask" },
        ],
      },
      {
        title: "Treatment",
        links: [
          { label: "Hair Oil", href: "/category/hair-care/hair-oil" },
          { label: "Hair Serum", href: "/category/hair-care/hair-serum" },
          { label: "Hair Fall Care", href: "/category/hair-care/hair-fall-care" },
        ],
      },
      {
        title: "Styling",
        links: [
          { label: "Hair Color", href: "/category/hair-care/hair-color" },
          { label: "Styling Gel & Spray", href: "/category/hair-care/styling-gel-spray" },
          { label: "Heat Protectant", href: "/category/hair-care/heat-protectant" },
        ],
      },
    ],
    promo: {
      title: "Healthy hair, every day",
      subtitle: "Wash, treat and style.",
      cta: "Shop Hair Care",
      href: "/category/hair-care",
    },
  },
  {
    label: "Fragrance",
    href: "/category/fragrance",
    icon: SprayCan,
    columns: [
      {
        title: "For Her",
        links: [
          { label: "Perfume", href: "/category/fragrance/womens-perfume" },
          { label: "Body Mist", href: "/category/fragrance/body-mist" },
        ],
      },
      {
        title: "For Him",
        links: [
          { label: "Perfume", href: "/category/fragrance/mens-perfume" },
          { label: "Body Spray", href: "/category/fragrance/body-spray" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Attar", href: "/category/fragrance/attar" },
          { label: "Fragrance Gift Sets", href: "/category/fragrance/fragrance-gift-sets" },
        ],
      },
    ],
    promo: {
      title: "Find your signature scent",
      subtitle: "Perfumes, body mists and attar.",
      cta: "Shop Fragrance",
      href: "/category/fragrance",
    },
  },
  {
    label: "Bath & Body",
    href: "/category/bath-body",
    icon: Bath,
    columns: [
      {
        title: "Bath",
        links: [
          { label: "Body Wash", href: "/category/bath-body/body-wash" },
          { label: "Soap", href: "/category/bath-body/soap" },
          { label: "Body Scrub", href: "/category/bath-body/body-scrub" },
        ],
      },
      {
        title: "Body Care",
        links: [
          { label: "Body Lotion", href: "/category/bath-body/body-lotion" },
          { label: "Body Butter", href: "/category/bath-body/body-butter" },
          { label: "Hand Cream", href: "/category/bath-body/hand-cream" },
          { label: "Foot Care", href: "/category/bath-body/foot-care" },
        ],
      },
      {
        title: "Personal Care",
        links: [
          { label: "Deodorant", href: "/category/bath-body/deodorant" },
          { label: "Hair Removal", href: "/category/bath-body/hair-removal" },
        ],
      },
    ],
    promo: {
      title: "Head-to-toe care",
      subtitle: "Bath essentials and body care.",
      cta: "Shop Bath & Body",
      href: "/category/bath-body",
    },
  },
  {
    label: "Tools & Accessories",
    href: "/category/tools-accessories",
    icon: Brush,
    columns: [
      {
        title: "Brushes & Sponges",
        links: [
          { label: "Makeup Brushes", href: "/category/tools-accessories/makeup-brushes" },
          { label: "Brush Sets", href: "/category/tools-accessories/brush-sets" },
          { label: "Beauty Sponges", href: "/category/tools-accessories/beauty-sponges" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Makeup Bags", href: "/category/tools-accessories/makeup-bags" },
          { label: "Mirrors", href: "/category/tools-accessories/mirrors" },
          { label: "Eyelash Curlers", href: "/category/tools-accessories/eyelash-curlers" },
          { label: "Tweezers", href: "/category/tools-accessories/tweezers" },
        ],
      },
    ],
    promo: {
      title: "The right tools",
      subtitle: "Brushes, sponges and everyday accessories.",
      cta: "Shop Tools & Accessories",
      href: "/category/tools-accessories",
    },
  },
  {
    label: "Clothing",
    href: "/category/clothing",
    icon: Shirt,
    columns: [
      {
        title: "Traditional Wear",
        links: [
          { label: "Sarees", href: "/category/clothing/sarees" },
          { label: "Salwar Kameez", href: "/category/clothing/salwar-kameez" },
          { label: "Three-Piece", href: "/category/clothing/three-piece" },
          { label: "Kurtis & Tunics", href: "/category/clothing/kurtis-tunics" },
          { label: "Lehengas", href: "/category/clothing/lehengas" },
          { label: "Orna & Dupatta", href: "/category/clothing/orna-dupatta" },
        ],
      },
      {
        title: "Western Wear",
        links: [
          { label: "Tops & T-Shirts", href: "/category/clothing/tops-t-shirts" },
          { label: "Shirts", href: "/category/clothing/shirts" },
          { label: "Dresses", href: "/category/clothing/dresses" },
          { label: "Jeans & Pants", href: "/category/clothing/jeans-pants" },
          { label: "Skirts", href: "/category/clothing/skirts" },
          { label: "Palazzos & Leggings", href: "/category/clothing/palazzos-leggings" },
        ],
      },
      {
        title: "Modest Wear",
        links: [
          { label: "Borka & Abaya", href: "/category/clothing/borka-abaya" },
          { label: "Hijab", href: "/category/clothing/hijab" },
          { label: "Scarves", href: "/category/clothing/scarves" },
        ],
      },
      {
        title: "Sleepwear & Innerwear",
        links: [
          { label: "Nightwear", href: "/category/clothing/nightwear" },
          { label: "Lingerie", href: "/category/clothing/lingerie" },
          { label: "Loungewear", href: "/category/clothing/loungewear" },
        ],
      },
      {
        title: "Winter Wear",
        links: [
          { label: "Sweaters", href: "/category/clothing/sweaters" },
          { label: "Hoodies", href: "/category/clothing/hoodies" },
          { label: "Jackets", href: "/category/clothing/jackets" },
          { label: "Shawls", href: "/category/clothing/shawls" },
        ],
      },
    ],
    promo: {
      title: "Style for every day",
      subtitle: "Traditional, western and modest wear for women.",
      cta: "Shop Clothing",
      href: "/category/clothing",
    },
  },
  {
    label: "Gadgets",
    href: "/category/gadgets",
    icon: Plug,
    columns: [
      {
        title: "Hair Styling",
        links: [
          { label: "Hair Dryers", href: "/category/gadgets/hair-dryers" },
          { label: "Hair Straighteners", href: "/category/gadgets/hair-straighteners" },
          { label: "Hair Curlers", href: "/category/gadgets/hair-curlers" },
          { label: "Hot Air Brushes", href: "/category/gadgets/hot-air-brushes" },
          { label: "Hair Crimpers", href: "/category/gadgets/hair-crimpers" },
        ],
      },
      {
        title: "Face & Skin Devices",
        links: [
          { label: "Facial Cleansing Brushes", href: "/category/gadgets/facial-cleansing-brushes" },
          { label: "Face Massagers & Rollers", href: "/category/gadgets/face-massagers-rollers" },
          { label: "Facial Steamers", href: "/category/gadgets/facial-steamers" },
          { label: "LED Face Masks", href: "/category/gadgets/led-face-masks" },
          { label: "Blackhead Removers", href: "/category/gadgets/blackhead-removers" },
        ],
      },
      {
        title: "Hair Removal & Grooming",
        links: [
          { label: "Epilators", href: "/category/gadgets/epilators" },
          { label: "Trimmers & Shavers", href: "/category/gadgets/trimmers-shavers" },
          { label: "IPL Devices", href: "/category/gadgets/ipl-devices" },
          { label: "Eyebrow Trimmers", href: "/category/gadgets/eyebrow-trimmers" },
        ],
      },
      {
        title: "Nail & Makeup Gadgets",
        links: [
          { label: "UV Nail Lamps", href: "/category/gadgets/uv-nail-lamps" },
          { label: "Nail Drills", href: "/category/gadgets/nail-drills" },
          { label: "LED Makeup Mirrors", href: "/category/gadgets/led-makeup-mirrors" },
          { label: "Makeup Brush Cleaners", href: "/category/gadgets/makeup-brush-cleaners" },
        ],
      },
      {
        title: "Lifestyle Gadgets",
        links: [
          { label: "Smart Watches", href: "/category/gadgets/smart-watches" },
          { label: "Earbuds & Headphones", href: "/category/gadgets/earbuds-headphones" },
          { label: "Power Banks", href: "/category/gadgets/power-banks" },
          { label: "Phone Accessories", href: "/category/gadgets/phone-accessories" },
        ],
      },
    ],
    promo: {
      title: "Beauty tech made easy",
      subtitle: "Styling tools, skin devices and everyday gadgets for women.",
      cta: "Shop Gadgets",
      href: "/category/gadgets",
    },
  },
  {
    label: "Jewelry",
    href: "/category/jewelry",
    icon: Gem,
    columns: [
      {
        title: "Earrings & Rings",
        links: [
          { label: "Earrings", href: "/category/jewelry/earrings" },
          { label: "Rings", href: "/category/jewelry/rings" },
          { label: "Nose Pins", href: "/category/jewelry/nose-pins" },
        ],
      },
      {
        title: "Necklaces & Sets",
        links: [
          { label: "Necklaces", href: "/category/jewelry/necklaces" },
          { label: "Pendants", href: "/category/jewelry/pendants" },
          { label: "Jewelry Sets", href: "/category/jewelry/jewelry-sets" },
          { label: "Bridal Jewelry", href: "/category/jewelry/bridal-jewelry" },
        ],
      },
      {
        title: "Hands & Feet",
        links: [
          { label: "Bangles", href: "/category/jewelry/bangles" },
          { label: "Bracelets", href: "/category/jewelry/bracelets" },
          { label: "Anklets", href: "/category/jewelry/anklets" },
        ],
      },
      {
        title: "Hair Accessories",
        links: [
          { label: "Hair Clips", href: "/category/jewelry/hair-clips" },
          { label: "Hair Bands", href: "/category/jewelry/hair-bands" },
          { label: "Scrunchies", href: "/category/jewelry/scrunchies" },
        ],
      },
    ],
    promo: {
      title: "The finishing touch",
      subtitle: "Earrings, necklaces, bangles and hair accessories.",
      cta: "Shop Jewelry",
      href: "/category/jewelry",
    },
  },
  {
    label: "Bags",
    href: "/category/bags",
    icon: Handbag,
    columns: [
      {
        title: "Handbags",
        links: [
          { label: "Shoulder Bags", href: "/category/bags/shoulder-bags" },
          { label: "Tote Bags", href: "/category/bags/tote-bags" },
          { label: "Crossbody Bags", href: "/category/bags/crossbody-bags" },
          { label: "Clutches", href: "/category/bags/clutches" },
        ],
      },
      {
        title: "Everyday",
        links: [
          { label: "Backpacks", href: "/category/bags/backpacks" },
          { label: "Wallets & Purses", href: "/category/bags/wallets-purses" },
          { label: "Pouches", href: "/category/bags/pouches" },
          { label: "Travel Bags", href: "/category/bags/travel-bags" },
        ],
      },
    ],
    promo: {
      title: "Carry it your way",
      subtitle: "Handbags, clutches, backpacks and wallets.",
      cta: "Shop Bags",
      href: "/category/bags",
    },
  },
  {
    label: "Footwear",
    href: "/category/footwear",
    icon: Footprints,
    columns: [
      {
        title: "Casual",
        links: [
          { label: "Sandals", href: "/category/footwear/sandals" },
          { label: "Flats", href: "/category/footwear/flats" },
          { label: "Slippers", href: "/category/footwear/slippers" },
          { label: "Sneakers", href: "/category/footwear/sneakers" },
        ],
      },
      {
        title: "Party & Formal",
        links: [
          { label: "Heels", href: "/category/footwear/heels" },
          { label: "Wedges", href: "/category/footwear/wedges" },
          { label: "Pumps", href: "/category/footwear/pumps" },
        ],
      },
      {
        title: "Traditional",
        links: [
          { label: "Nagra", href: "/category/footwear/nagra" },
          { label: "Khussa", href: "/category/footwear/khussa" },
        ],
      },
    ],
    promo: {
      title: "Step out in style",
      subtitle: "Sandals, heels, flats and traditional footwear.",
      cta: "Shop Footwear",
      href: "/category/footwear",
    },
  },
  {
    label: "Mom & Baby",
    href: "/category/mom-baby",
    icon: Baby,
    columns: [
      {
        title: "Baby Care",
        links: [
          { label: "Baby Lotion", href: "/category/mom-baby/baby-lotion" },
          { label: "Baby Oil", href: "/category/mom-baby/baby-oil" },
          { label: "Baby Shampoo & Wash", href: "/category/mom-baby/baby-shampoo-wash" },
          { label: "Baby Powder", href: "/category/mom-baby/baby-powder" },
          { label: "Diaper Rash Cream", href: "/category/mom-baby/diaper-rash-cream" },
        ],
      },
      {
        title: "Mom Care",
        links: [
          { label: "Stretch Mark Care", href: "/category/mom-baby/stretch-mark-care" },
          { label: "Maternity Wear", href: "/category/mom-baby/maternity-wear" },
          { label: "Nursing Essentials", href: "/category/mom-baby/nursing-essentials" },
        ],
      },
    ],
    promo: {
      title: "Gentle care for two",
      subtitle: "Baby essentials and care for new mothers.",
      cta: "Shop Mom & Baby",
      href: "/category/mom-baby",
    },
  },
  {
    label: "Health & Wellness",
    href: "/category/health-wellness",
    icon: HeartPulse,
    columns: [
      {
        title: "Feminine Care",
        links: [
          { label: "Sanitary Pads", href: "/category/health-wellness/sanitary-pads" },
          { label: "Intimate Wash", href: "/category/health-wellness/intimate-wash" },
          { label: "Menstrual Cups", href: "/category/health-wellness/menstrual-cups" },
        ],
      },
      {
        title: "Supplements",
        links: [
          { label: "Vitamins", href: "/category/health-wellness/vitamins" },
          { label: "Hair & Skin Supplements", href: "/category/health-wellness/hair-skin-supplements" },
          { label: "Collagen", href: "/category/health-wellness/collagen" },
        ],
      },
      {
        title: "Oral Care",
        links: [
          { label: "Toothpaste", href: "/category/health-wellness/toothpaste" },
          { label: "Mouthwash", href: "/category/health-wellness/mouthwash" },
          { label: "Teeth Whitening", href: "/category/health-wellness/teeth-whitening" },
        ],
      },
    ],
    promo: {
      title: "Feel good every day",
      subtitle: "Feminine care, supplements and oral care.",
      cta: "Shop Health & Wellness",
      href: "/category/health-wellness",
    },
  },
  {
    label: "Gift Sets",
    href: "/category/gift-sets",
    icon: Gift,
    columns: [
      {
        title: "By Occasion",
        links: [
          { label: "Birthday Gifts", href: "/category/gift-sets/birthday-gifts" },
          { label: "Wedding Gifts", href: "/category/gift-sets/wedding-gifts" },
          { label: "Eid Gifts", href: "/category/gift-sets/eid-gifts" },
          { label: "Anniversary Gifts", href: "/category/gift-sets/anniversary-gifts" },
        ],
      },
      {
        title: "By Type",
        links: [
          { label: "Beauty Hampers", href: "/category/gift-sets/beauty-hampers" },
          { label: "Skincare Sets", href: "/category/gift-sets/skincare-sets" },
          { label: "Combo Packs", href: "/category/gift-sets/combo-packs" },
        ],
      },
    ],
    promo: {
      title: "Gifts she will love",
      subtitle: "Ready-made sets and hampers for every occasion.",
      cta: "Shop Gift Sets",
      href: "/category/gift-sets",
    },
  },
];
