import { getFaqCategory, type FaqItem } from "./faq";

interface TitledText {
  title: string;
  description: string;
}

/** Every piece of text on the Sell on BongoOcean page, in one language. */
export interface SellCopy {
  /** Hero subtitle and the page's meta description. */
  description: string;
  /**
   * Four benefit cards — SellContent pairs them with icons by position:
   * reach, delivery, trusted storefront, seller team.
   */
  benefits: { title: string; subtitle: string; items: TitledText[] };
  requirements: { title: string; subtitle: string; items: string[] };
  steps: { title: string; subtitle: string; items: TitledText[] };
  faq: { title: string; items: FaqItem[] };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
}

const en: SellCopy = {
  description:
    "Open your store on BongoOcean and reach shoppers all over Bangladesh.",
  benefits: {
    title: "Turn your inventory into income",
    subtitle:
      "Everything you need to sell across Bangladesh, in one marketplace.",
    items: [
      {
        title: "Reach buyers nationwide",
        description:
          "List once and put your products in front of shoppers in every division of Bangladesh.",
      },
      {
        title: "Delivery handled",
        description:
          "Orders go out through our courier network with cash on delivery, tracked from dispatch to doorstep.",
      },
      {
        title: "A trusted storefront",
        description:
          "Shoppers buy with confidence on a marketplace where every seller is reviewed.",
      },
      {
        title: "A team behind you",
        description:
          "Our seller team helps you set up your store and get your listings right.",
      },
    ],
  },
  requirements: {
    title: "What you need to get started",
    subtitle:
      "We keep the bar simple and clear, so shoppers can trust every store on BongoOcean.",
    items: [
      "A registered business, or proof that you manufacture or own the brand.",
      "Genuine products that are legal to sell in Bangladesh.",
      "Clear photos and accurate details for every product and variation.",
      "Reliable stock levels and the ability to dispatch orders on time.",
    ],
  },
  steps: {
    title: "How it works",
    subtitle: "Four steps from application to your first order.",
    items: [
      {
        title: "Apply",
        description:
          "Send us your business details and tell us what you would like to sell.",
      },
      {
        title: "Get verified",
        description:
          "Our seller team reviews your application and confirms your business.",
      },
      {
        title: "List your products",
        description:
          "Add photos, prices, variations and stock. We help you get the first listings live.",
      },
      {
        title: "Start selling",
        description:
          "Orders come in, parcels go out, and your store grows with every delivery.",
      },
    ],
  },
  faq: {
    title: "Seller questions",
    // Shared with the FAQ page, so the two never disagree.
    items: getFaqCategory("selling")?.items ?? [],
  },
  cta: {
    title: "Open your store on BongoOcean",
    description:
      "Tell us about your business and our seller team will be in touch to help you get set up.",
    primary: "Apply to sell",
    secondary: "Read the seller guide",
  },
};

export function getSellCopy(): SellCopy {
  return en;
}
