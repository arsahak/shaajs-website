import { getFaqCategory, type FaqItem } from "./faq";

interface TitledText {
  title: string;
  description: string;
}

/** Every piece of text on the Returns & Refunds page, in one language. */
export interface ReturnsCopy {
  /** Hero subtitle and the page's meta description. */
  description: string;
  /** Three items — ReturnsContent pairs them with icons by position. */
  highlights: { title: string; subtitle: string; items: TitledText[] };
  policy: {
    title: string;
    subtitle: string;
    eligibleTitle: string;
    eligible: string[];
    notEligibleTitle: string;
    notEligible: string[];
  };
  steps: { title: string; subtitle: string; items: TitledText[] };
  faq: { title: string; items: FaqItem[] };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
}

const en: ReturnsCopy = {
  description:
    "30-day returns, cover for damaged or wrong items, and how refunds work.",
  highlights: {
    title: "Easy, hassle-free returns",
    subtitle: "If something is not right, we will help you put it right.",
    items: [
      {
        title: "30-day returns",
        description:
          "Changed your mind? Request a return within 30 days of the day your order is delivered.",
      },
      {
        title: "Damaged or wrong item",
        description:
          "Tell us within 48 hours with photos and we will replace or refund it at no extra cost.",
      },
      {
        title: "Refunds in 5–10 days",
        description:
          "Once the returned item is received and checked, your refund is issued within 5–10 business days.",
      },
    ],
  },
  policy: {
    title: "What can be returned",
    subtitle: "A quick guide to what qualifies and what does not.",
    eligibleTitle: "Eligible for return",
    eligible: [
      "Unused items in their original condition.",
      "Items in the original packaging with all tags and accessories.",
      "Items that arrived damaged, faulty or different from the listing.",
      "Orders where the wrong product, size or colour was sent.",
    ],
    notEligibleTitle: "Not eligible for return",
    notEligible: [
      "Items that have been used, washed or altered.",
      "Personal care, beauty and hygiene products once opened.",
      "Groceries and other perishable goods.",
      "Custom-made or personalised items.",
    ],
  },
  steps: {
    title: "How to return an item",
    subtitle: "Four steps from request to refund.",
    items: [
      {
        title: "Contact support",
        description:
          "Send us your order number and the reason for the return, with photos if the item is damaged.",
      },
      {
        title: "Get approval",
        description:
          "We confirm the item is eligible and tell you exactly how to send it back.",
      },
      {
        title: "Pack and send",
        description:
          "Pack the item securely in its original packaging and hand it over as instructed.",
      },
      {
        title: "Receive your refund",
        description:
          "After inspection we send the refund to your bKash, Nagad or bank account.",
      },
    ],
  },
  faq: {
    title: "Returns questions",
    // Shared with the FAQ page, so the two never disagree.
    items: getFaqCategory("returns-refunds")?.items ?? [],
  },
  cta: {
    title: "Need to start a return?",
    description:
      "Have your order number ready and our support team will take it from there.",
    primary: "Contact support",
    secondary: "Track your order",
  },
};

export function getReturnsCopy(): ReturnsCopy {
  return en;
}
