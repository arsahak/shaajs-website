import {
  Baby,
  Bath,
  Brush,
  Droplets,
  Footprints,
  Gem,
  Gift,
  Glasses,
  Handbag,
  HeartPulse,
  House,
  Leaf,
  Palette,
  Plug,
  Scissors,
  Shirt,
  SprayCan,
  UserRound,
  Watch,
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
//
// Mirrors the catalogue's category tree (backend/scripts/data/
// cosmeticsCategoryTree.ts) in the same order: each department, its groups as
// columns, and the categories in each group as links. A department's groups
// with nothing under them share one last column.
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
          { label: "Tinted Moisturizer", href: "/category/makeup/tinted-moisturizer" },
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
          { label: "Under Eye Concealer", href: "/category/makeup/under-eye-concealer" },
          { label: "Eye Makeup Remover", href: "/category/makeup/eye-makeup-remover" },
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
          { label: "Lip Plumper", href: "/category/makeup/lip-plumper" },
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
          { label: "Nail Polish Sets", href: "/category/makeup/nail-polish-sets" },
          { label: "Manicure & Pedicure Kits", href: "/category/makeup/manicure-pedicure-kits" },
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
          { label: "Facial Wipes", href: "/category/skincare/facial-wipes" },
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
          { label: "Ampoule", href: "/category/skincare/ampoule" },
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
          { label: "Dull Skin", href: "/category/skincare/dull-skin" },
          { label: "Tan Removal", href: "/category/skincare/tan-removal" },
          { label: "Winter Care", href: "/category/skincare/winter-care" },
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
          { label: "Facial Kits", href: "/category/skincare/facial-kits" },
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
          { label: "Eye Gel", href: "/category/skincare/eye-gel" },
          { label: "Eye Roller", href: "/category/skincare/eye-roller" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "K-Beauty", href: "/category/skincare/k-beauty" },
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
          { label: "Hair Wax", href: "/category/hair-care/hair-wax" },
          { label: "Hair Primer", href: "/category/hair-care/hair-primer" },
        ],
      },
      {
        title: "Shop by Concern",
        links: [
          { label: "Dandruff", href: "/category/hair-care/dandruff" },
          { label: "Dry & Frizzy Hair", href: "/category/hair-care/dry-frizzy-hair" },
          { label: "Split Ends", href: "/category/hair-care/split-ends" },
          { label: "Color Protection", href: "/category/hair-care/color-protection" },
          { label: "Scalp Treatment", href: "/category/hair-care/scalp-treatment" },
        ],
      },
      {
        title: "By Hair Type",
        links: [
          { label: "Curly & Wavy Hair", href: "/category/hair-care/curly-wavy-hair" },
          { label: "Straight Hair", href: "/category/hair-care/straight-hair" },
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
          { label: "Unisex Perfume", href: "/category/fragrance/unisex-perfume" },
          { label: "Cologne", href: "/category/fragrance/cologne" },
          { label: "Eau de Parfum (EDP)", href: "/category/fragrance/eau-de-parfum-edp" },
          { label: "Eau de Toilette (EDT)", href: "/category/fragrance/eau-de-toilette-edt" },
          { label: "High-End Perfume", href: "/category/fragrance/high-end-perfume" },
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
          { label: "Talcum Powder", href: "/category/bath-body/talcum-powder" },
          { label: "Loofahs & Sponges", href: "/category/bath-body/loofahs-sponges" },
          { label: "Hand Wash", href: "/category/bath-body/hand-wash" },
          { label: "Hand Sanitizer", href: "/category/bath-body/hand-sanitizer" },
        ],
      },
      {
        title: "Body Care",
        links: [
          { label: "Body Lotion", href: "/category/bath-body/body-lotion" },
          { label: "Body Butter", href: "/category/bath-body/body-butter" },
          { label: "Hand Cream", href: "/category/bath-body/hand-cream" },
          { label: "Foot Care", href: "/category/bath-body/foot-care" },
          { label: "Mehedi & Henna", href: "/category/bath-body/mehedi-henna" },
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
    label: "Men",
    href: "/category/men",
    icon: UserRound,
    columns: [
      {
        title: "Skin Care",
        links: [
          { label: "Men's Face Wash", href: "/category/men/mens-face-wash" },
          { label: "Men's Moisturizer", href: "/category/men/mens-moisturizer" },
          { label: "Men's Sunscreen", href: "/category/men/mens-sunscreen" },
          { label: "Men's Face Scrub", href: "/category/men/mens-face-scrub" },
        ],
      },
      {
        title: "Hair Care",
        links: [
          { label: "Men's Shampoo", href: "/category/men/mens-shampoo" },
          { label: "Men's Hair Oil", href: "/category/men/mens-hair-oil" },
          { label: "Men's Hair Color", href: "/category/men/mens-hair-color" },
          { label: "Men's Hair Styling", href: "/category/men/mens-hair-styling" },
        ],
      },
      {
        title: "Bath & Body",
        links: [
          { label: "Men's Body Wash & Shower Gel", href: "/category/men/mens-body-wash-shower-gel" },
          { label: "Men's Soap", href: "/category/men/mens-soap" },
          { label: "Men's Body Lotion", href: "/category/men/mens-body-lotion" },
        ],
      },
      {
        title: "Shaving",
        links: [
          { label: "Razors", href: "/category/men/razors" },
          { label: "Shaving Cream, Foam & Gel", href: "/category/men/shaving-cream-foam-gel" },
          { label: "Shaving Brushes", href: "/category/men/shaving-brushes" },
          { label: "Aftershave Lotion & Balm", href: "/category/men/aftershave-lotion-balm" },
          { label: "Beard & Moustache Care", href: "/category/men/beard-moustache-care" },
        ],
      },
    ],
    promo: {
      title: "Grooming for him",
      subtitle: "Skin care, hair care, bath and shaving essentials for men.",
      cta: "Shop Men",
      href: "/category/men",
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
          { label: "Sharpeners", href: "/category/tools-accessories/sharpeners" },
          { label: "Hair Combs & Brushes", href: "/category/tools-accessories/hair-combs-brushes" },
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
        title: "Women's Traditional",
        links: [
          { label: "Sarees", href: "/category/clothing/sarees" },
          { label: "Salwar Kameez", href: "/category/clothing/salwar-kameez" },
          { label: "Three-Piece", href: "/category/clothing/three-piece" },
          { label: "Kurtis & Tunics", href: "/category/clothing/kurtis-tunics" },
          { label: "Lehengas", href: "/category/clothing/lehengas" },
          { label: "Orna & Dupatta", href: "/category/clothing/orna-dupatta" },
          { label: "Blouses", href: "/category/clothing/blouses" },
        ],
      },
      {
        title: "Women's Western",
        links: [
          { label: "Tops & T-Shirts", href: "/category/clothing/tops-t-shirts" },
          { label: "Shirts", href: "/category/clothing/shirts" },
          { label: "Dresses", href: "/category/clothing/dresses" },
          { label: "Jeans & Pants", href: "/category/clothing/jeans-pants" },
          { label: "Skirts", href: "/category/clothing/skirts" },
          { label: "Palazzos & Leggings", href: "/category/clothing/palazzos-leggings" },
          { label: "Crop Tops", href: "/category/clothing/crop-tops" },
          { label: "Co-ord Sets", href: "/category/clothing/co-ord-sets" },
          { label: "Jumpsuits & Rompers", href: "/category/clothing/jumpsuits-rompers" },
          { label: "Kaftans", href: "/category/clothing/kaftans" },
          { label: "Party Gowns", href: "/category/clothing/party-gowns" },
          { label: "Women's Shorts", href: "/category/clothing/womens-shorts" },
          { label: "Shrugs & Cardigans", href: "/category/clothing/shrugs-cardigans" },
          { label: "Women's Blazers", href: "/category/clothing/womens-blazers" },
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
        title: "Women's Winter Wear",
        links: [
          { label: "Sweaters", href: "/category/clothing/sweaters" },
          { label: "Hoodies", href: "/category/clothing/hoodies" },
          { label: "Jackets", href: "/category/clothing/jackets" },
          { label: "Shawls", href: "/category/clothing/shawls" },
        ],
      },
      {
        title: "Men's Topwear",
        links: [
          { label: "Men's T-Shirts", href: "/category/clothing/mens-t-shirts" },
          { label: "Men's Polo Shirts", href: "/category/clothing/mens-polo-shirts" },
          { label: "Men's Casual Shirts", href: "/category/clothing/mens-casual-shirts" },
          { label: "Men's Formal Shirts", href: "/category/clothing/mens-formal-shirts" },
        ],
      },
      {
        title: "Men's Bottomwear",
        links: [
          { label: "Men's Jeans", href: "/category/clothing/mens-jeans" },
          { label: "Men's Chinos & Gabardine", href: "/category/clothing/mens-chinos-gabardine" },
          { label: "Men's Formal Pants", href: "/category/clothing/mens-formal-pants" },
          { label: "Men's Joggers", href: "/category/clothing/mens-joggers" },
          { label: "Men's Shorts & Three-Quarters", href: "/category/clothing/mens-shorts-three-quarters" },
        ],
      },
      {
        title: "Men's Ethnic Wear",
        links: [
          { label: "Panjabi", href: "/category/clothing/panjabi" },
          { label: "Fatua", href: "/category/clothing/fatua" },
          { label: "Men's Pajamas", href: "/category/clothing/mens-pajamas" },
        ],
      },
      {
        title: "Men's Outerwear",
        links: [
          { label: "Men's Jackets", href: "/category/clothing/mens-jackets" },
          { label: "Men's Blazers", href: "/category/clothing/mens-blazers" },
          { label: "Men's Hoodies & Sweatshirts", href: "/category/clothing/mens-hoodies-sweatshirts" },
          { label: "Men's Sweaters", href: "/category/clothing/mens-sweaters" },
        ],
      },
      {
        title: "Men's Innerwear",
        links: [
          { label: "Men's Vests", href: "/category/clothing/mens-vests" },
          { label: "Men's Briefs & Boxers", href: "/category/clothing/mens-briefs-boxers" },
        ],
      },
      {
        title: "Activewear",
        links: [
          { label: "Sports Tops & T-Shirts", href: "/category/clothing/sports-tops-t-shirts" },
          { label: "Track Pants", href: "/category/clothing/track-pants" },
          { label: "Tracksuits", href: "/category/clothing/tracksuits" },
          { label: "Jerseys", href: "/category/clothing/jerseys" },
          { label: "Yoga Pants & Tights", href: "/category/clothing/yoga-pants-tights" },
        ],
      },
      {
        title: "Fashion Accessories",
        links: [
          { label: "Caps", href: "/category/clothing/caps" },
          { label: "Hats", href: "/category/clothing/hats" },
          { label: "Belts", href: "/category/clothing/belts" },
          { label: "Socks", href: "/category/clothing/socks" },
          { label: "Ties", href: "/category/clothing/ties" },
        ],
      },
    ],
    promo: {
      title: "Style for every day",
      subtitle: "Western, traditional and everyday wear for women and men.",
      cta: "Shop Clothing",
      href: "/category/clothing",
    },
  },
  {
    label: "Footwear",
    href: "/category/footwear",
    icon: Footprints,
    columns: [
      {
        title: "Women's Casual",
        links: [
          { label: "Sandals", href: "/category/footwear/sandals" },
          { label: "Flats", href: "/category/footwear/flats" },
          { label: "Slippers", href: "/category/footwear/slippers" },
          { label: "Sneakers", href: "/category/footwear/sneakers" },
          { label: "Mules", href: "/category/footwear/mules" },
          { label: "Flip Flops", href: "/category/footwear/flip-flops" },
        ],
      },
      {
        title: "Women's Party & Formal",
        links: [
          { label: "Heels", href: "/category/footwear/heels" },
          { label: "Wedges", href: "/category/footwear/wedges" },
          { label: "Pumps", href: "/category/footwear/pumps" },
          { label: "Block Heels", href: "/category/footwear/block-heels" },
          { label: "Stilettos", href: "/category/footwear/stilettos" },
        ],
      },
      {
        title: "Traditional",
        links: [
          { label: "Nagra", href: "/category/footwear/nagra" },
          { label: "Khussa", href: "/category/footwear/khussa" },
        ],
      },
      {
        title: "Men's Shoes",
        links: [
          { label: "Men's Formal Shoes", href: "/category/footwear/mens-formal-shoes" },
          { label: "Men's Loafers", href: "/category/footwear/mens-loafers" },
          { label: "Men's Casual Shoes", href: "/category/footwear/mens-casual-shoes" },
          { label: "Men's Sneakers", href: "/category/footwear/mens-sneakers" },
          { label: "Men's Sports Shoes", href: "/category/footwear/mens-sports-shoes" },
          { label: "Men's Boots", href: "/category/footwear/mens-boots" },
          { label: "Men's Sandals", href: "/category/footwear/mens-sandals" },
          { label: "Men's Slippers & Flip Flops", href: "/category/footwear/mens-slippers-flip-flops" },
        ],
      },
    ],
    promo: {
      title: "Step out in style",
      subtitle: "Sandals, heels, sneakers and shoes for women and men.",
      cta: "Shop Footwear",
      href: "/category/footwear",
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
    label: "Watches",
    href: "/category/watches",
    icon: Watch,
    columns: [
      {
        title: "Men's Watches",
        links: [
          { label: "Men's Analog Watches", href: "/category/watches/mens-analog-watches" },
          { label: "Men's Digital Watches", href: "/category/watches/mens-digital-watches" },
          { label: "Men's Chronograph Watches", href: "/category/watches/mens-chronograph-watches" },
          { label: "Men's Leather Strap Watches", href: "/category/watches/mens-leather-strap-watches" },
          { label: "Men's Metal Strap Watches", href: "/category/watches/mens-metal-strap-watches" },
        ],
      },
      {
        title: "Women's Watches",
        links: [
          { label: "Women's Analog Watches", href: "/category/watches/womens-analog-watches" },
          { label: "Women's Digital Watches", href: "/category/watches/womens-digital-watches" },
          { label: "Bracelet Watches", href: "/category/watches/bracelet-watches" },
          { label: "Women's Leather Strap Watches", href: "/category/watches/womens-leather-strap-watches" },
          { label: "Women's Metal Strap Watches", href: "/category/watches/womens-metal-strap-watches" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Couple Watches", href: "/category/watches/couple-watches" },
          { label: "Kids' Watches", href: "/category/watches/kids-watches" },
          { label: "Sports Watches", href: "/category/watches/sports-watches" },
          { label: "Luxury Watches", href: "/category/watches/luxury-watches" },
          { label: "Watch Gift Sets", href: "/category/watches/watch-gift-sets" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Watch Straps", href: "/category/watches/watch-straps" },
          { label: "Watch Boxes & Cases", href: "/category/watches/watch-boxes-cases" },
        ],
      },
    ],
    promo: {
      title: "Time, in style",
      subtitle: "Men's, women's, couple and kids' watches.",
      cta: "Shop Watches",
      href: "/category/watches",
    },
  },
  {
    label: "Eyewear",
    href: "/category/eyewear",
    icon: Glasses,
    columns: [
      {
        title: "Sunglasses",
        links: [
          { label: "Men's Sunglasses", href: "/category/eyewear/mens-sunglasses" },
          { label: "Women's Sunglasses", href: "/category/eyewear/womens-sunglasses" },
          { label: "Unisex Sunglasses", href: "/category/eyewear/unisex-sunglasses" },
          { label: "Kids' Sunglasses", href: "/category/eyewear/kids-sunglasses" },
        ],
      },
      {
        title: "By Style",
        links: [
          { label: "Aviator Sunglasses", href: "/category/eyewear/aviator-sunglasses" },
          { label: "Wayfarer Sunglasses", href: "/category/eyewear/wayfarer-sunglasses" },
          { label: "Round Sunglasses", href: "/category/eyewear/round-sunglasses" },
          { label: "Cat-Eye Sunglasses", href: "/category/eyewear/cat-eye-sunglasses" },
          { label: "Square Sunglasses", href: "/category/eyewear/square-sunglasses" },
          { label: "Oversized Sunglasses", href: "/category/eyewear/oversized-sunglasses" },
          { label: "Polarized Sunglasses", href: "/category/eyewear/polarized-sunglasses" },
          { label: "Sports Sunglasses", href: "/category/eyewear/sports-sunglasses" },
        ],
      },
      {
        title: "Eyeglasses",
        links: [
          { label: "Eyeglass Frames", href: "/category/eyewear/eyeglass-frames" },
          { label: "Blue Light Glasses", href: "/category/eyewear/blue-light-glasses" },
          { label: "Reading Glasses", href: "/category/eyewear/reading-glasses" },
        ],
      },
      {
        title: "Contact Lenses",
        links: [
          { label: "Color Contact Lenses", href: "/category/eyewear/color-contact-lenses" },
          { label: "Clear Contact Lenses", href: "/category/eyewear/clear-contact-lenses" },
          { label: "Lens Solution", href: "/category/eyewear/lens-solution" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Glasses Cases", href: "/category/eyewear/glasses-cases" },
          { label: "Lens Cleaners", href: "/category/eyewear/lens-cleaners" },
          { label: "Glasses Chains & Straps", href: "/category/eyewear/glasses-chains-straps" },
        ],
      },
    ],
    promo: {
      title: "See the world in style",
      subtitle: "Sunglasses, eyeglasses and contact lenses.",
      cta: "Shop Eyewear",
      href: "/category/eyewear",
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
          { label: "Fitness Bands", href: "/category/gadgets/fitness-bands" },
        ],
      },
      {
        title: "Mobile Accessories",
        links: [
          { label: "Chargers & Adapters", href: "/category/gadgets/chargers-adapters" },
          { label: "Data Cables", href: "/category/gadgets/data-cables" },
          { label: "Phone Cases & Covers", href: "/category/gadgets/phone-cases-covers" },
          { label: "Screen Protectors", href: "/category/gadgets/screen-protectors" },
          { label: "Phone Holders & Stands", href: "/category/gadgets/phone-holders-stands" },
        ],
      },
      {
        title: "Audio",
        links: [
          { label: "Bluetooth Speakers", href: "/category/gadgets/bluetooth-speakers" },
          { label: "Neckband Earphones", href: "/category/gadgets/neckband-earphones" },
          { label: "Wired Earphones", href: "/category/gadgets/wired-earphones" },
        ],
      },
      {
        title: "Photography & Content",
        links: [
          { label: "Ring Lights", href: "/category/gadgets/ring-lights" },
          { label: "Tripods & Selfie Sticks", href: "/category/gadgets/tripods-selfie-sticks" },
          { label: "Wireless Microphones", href: "/category/gadgets/wireless-microphones" },
          { label: "Action Cameras", href: "/category/gadgets/action-cameras" },
        ],
      },
      {
        title: "Computer Accessories",
        links: [
          { label: "Keyboards & Mouse", href: "/category/gadgets/keyboards-mouse" },
          { label: "Pendrives & Memory Cards", href: "/category/gadgets/pendrives-memory-cards" },
          { label: "USB Hubs", href: "/category/gadgets/usb-hubs" },
          { label: "Laptop Stands", href: "/category/gadgets/laptop-stands" },
        ],
      },
      {
        title: "Home & Personal Gadgets",
        links: [
          { label: "Rechargeable Fans", href: "/category/gadgets/rechargeable-fans" },
          { label: "Desk Lamps", href: "/category/gadgets/desk-lamps" },
          { label: "Weighing Scales", href: "/category/gadgets/weighing-scales" },
          { label: "Massagers", href: "/category/gadgets/massagers" },
        ],
      },
    ],
    promo: {
      title: "Gadgets for every day",
      subtitle: "Beauty tech, mobile accessories, audio and everyday gadgets.",
      cta: "Shop Gadgets",
      href: "/category/gadgets",
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
          { label: "Baby Soap", href: "/category/mom-baby/baby-soap" },
          { label: "Baby Cream", href: "/category/mom-baby/baby-cream" },
          { label: "Baby Wipes", href: "/category/mom-baby/baby-wipes" },
          { label: "Baby Sunscreen", href: "/category/mom-baby/baby-sunscreen" },
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
          { label: "Toothbrush", href: "/category/health-wellness/toothbrush" },
          { label: "Dental Floss", href: "/category/health-wellness/dental-floss" },
        ],
      },
      {
        title: "Wellness",
        links: [
          { label: "Sexual Wellness", href: "/category/health-wellness/sexual-wellness" },
          { label: "Weight Management", href: "/category/health-wellness/weight-management" },
          { label: "Health & Fitness", href: "/category/health-wellness/health-fitness" },
        ],
      },
    ],
    promo: {
      title: "Feel good every day",
      subtitle: "Feminine care, supplements, oral care and wellness.",
      cta: "Shop Health & Wellness",
      href: "/category/health-wellness",
    },
  },
  {
    label: "Home Care",
    href: "/category/home-care",
    icon: House,
    columns: [
      {
        title: "Home Care",
        links: [
          { label: "Air Fresheners", href: "/category/home-care/air-fresheners" },
          { label: "Bathroom Essentials", href: "/category/home-care/bathroom-essentials" },
          { label: "Germ Control", href: "/category/home-care/germ-control" },
        ],
      },
    ],
    promo: {
      title: "A fresh, clean home",
      subtitle: "Air fresheners, bathroom essentials and germ control.",
      cta: "Shop Home Care",
      href: "/category/home-care",
    },
  },
  {
    label: "Natural",
    href: "/category/natural",
    icon: Leaf,
    columns: [],
    promo: {
      title: "Naturally yours",
      subtitle: "Natural and herbal beauty products.",
      cta: "Shop Natural",
      href: "/category/natural",
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
