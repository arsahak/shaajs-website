import { BD_DIVISIONS, type BdDivision } from "./checkout";
import { formatTaka, insideDhaka, outsideDhaka } from "./delivery";
import { getFaqCategory, type FaqItem } from "./faq";

interface TitledText {
  title: string;
  description: string;
}

/** Every piece of text on the Shipping Info page, in one language. */
export interface ShippingCopy {
  /** Hero subtitle and the page's meta description. */
  description: string;
  zones: {
    title: string;
    subtitle: string;
    feeLabel: string;
    estimateLabel: string;
    /** In the same order as `deliveryZones`: Inside Dhaka, Outside Dhaka. */
    items: {
      name: string;
      description: string;
      fee: string;
      /** Badge text, e.g. "1–3 working days". */
      workingDays: string;
      /** Short form, e.g. "1–3 days". */
      days: string;
    }[];
  };
  coverage: {
    title: string;
    subtitle: string;
    divisions: Record<BdDivision, string>;
  };
  steps: { title: string; subtitle: string; items: TitledText[] };
  /** Four items — ShippingContent pairs them with icons by position. */
  goodToKnow: { title: string; items: TitledText[] };
  faq: { title: string; items: FaqItem[] };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
}

const en: ShippingCopy = {
  description:
    "Delivery zones, fees and timelines for orders anywhere in Bangladesh.",
  zones: {
    title: "Delivery across Bangladesh",
    subtitle:
      "Two delivery zones, one flat fee each — shown again at checkout before you confirm.",
    feeLabel: "Delivery fee",
    estimateLabel: "Estimated delivery",
    items: [insideDhaka, outsideDhaka].map((zone) => ({
      name: zone.name,
      description: zone.description,
      fee: formatTaka(zone.fee),
      workingDays: `${zone.days} working days`,
      days: `${zone.days} days`,
    })),
  },
  coverage: {
    title: "Where we deliver",
    subtitle: `Every district in all ${BD_DIVISIONS.length} divisions of Bangladesh.`,
    divisions: {
      Dhaka: "Dhaka",
      Chattogram: "Chattogram",
      Rajshahi: "Rajshahi",
      Khulna: "Khulna",
      Barishal: "Barishal",
      Sylhet: "Sylhet",
      Rangpur: "Rangpur",
      Mymensingh: "Mymensingh",
    },
  },
  steps: {
    title: "How your order reaches you",
    subtitle: "Four stages between checkout and your doorstep.",
    items: [
      {
        title: "Order confirmed",
        description:
          "After you place the order we contact you to confirm the items and your delivery address.",
      },
      {
        title: "Packed with care",
        description:
          "Your items are checked, packed securely and labelled with your order number.",
      },
      {
        title: "Handed to the courier",
        description:
          "Our delivery partner collects the parcel and brings it to your area.",
      },
      {
        title: "Delivered to your door",
        description:
          "The rider calls before arriving. Check the parcel, then pay in cash.",
      },
    ],
  },
  goodToKnow: {
    title: "Good to know",
    items: [
      {
        title: "Cash on Delivery",
        description:
          "Pay the order total and the delivery fee in cash when the parcel reaches you.",
      },
      {
        title: "Keep your phone on",
        description:
          "We call to confirm the order, and the rider calls again before delivery.",
      },
      {
        title: "Complete address",
        description:
          "Add your division, district, upazila and a clear street address so the rider finds you first time.",
      },
      {
        title: "Order tracking",
        description:
          "Follow your order from pending to delivered on the Track Order page or under My Orders.",
      },
    ],
  },
  faq: {
    title: "Delivery questions",
    // Shared with the FAQ page, so the two never disagree.
    items: getFaqCategory("shipping-delivery")?.items ?? [],
  },
  cta: {
    title: "Waiting on a parcel?",
    description:
      "Enter your order number to see exactly where your order is right now.",
    primary: "Track your order",
    secondary: "Contact support",
  },
};

export function getShippingCopy(): ShippingCopy {
  return en;
}
