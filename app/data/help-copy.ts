interface TitledText {
  title: string;
  description: string;
}

/** Text of the Help Center page. The questions themselves come from the FAQ. */
export interface HelpCopy {
  /** Hero subtitle and the page's meta description. */
  description: string;
  /**
   * Six topic cards — HelpContent pairs them with icons and links by position:
   * track order, shipping, returns, account, selling, all FAQs.
   */
  topics: { title: string; subtitle: string; items: TitledText[] };
  popular: { title: string; subtitle: string; viewAll: string };
  cta: { title: string; description: string; primary: string };
}

/** Text of the FAQ page around the questions. */
export interface FaqPageCopy {
  /** Hero subtitle and the page's meta description. */
  description: string;
  topicsLabel: string;
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
}

const helpEn: HelpCopy = {
  description:
    "Find answers about orders, delivery, returns and your Shaajs account.",
  topics: {
    title: "How can we help?",
    subtitle: "Pick a topic to find the answer you need.",
    items: [
      {
        title: "Track an order",
        description: "See where your parcel is and what happens next.",
      },
      {
        title: "Shipping & delivery",
        description: "Delivery estimates, fees and how shipping works.",
      },
      {
        title: "Returns & refunds",
        description: "What can be returned and how to send it back.",
      },
      {
        title: "Your account",
        description: "Update your profile, address and settings.",
      },
      {
        title: "Selling on Shaajs",
        description: "Open a store and reach buyers across Bangladesh.",
      },
      {
        title: "All FAQs",
        description: "Every common question, grouped by topic.",
      },
    ],
  },
  popular: {
    title: "Popular questions",
    subtitle: "The answers shoppers look for most often.",
    viewAll: "View all FAQs",
  },
  cta: {
    title: "Still need a hand?",
    description:
      "Our support team is available 24/7. Send us a message and we will get back to you.",
    primary: "Contact support",
  },
};

const faqPageEn: FaqPageCopy = {
  description:
    "Answers to the most common questions about shopping and selling on Shaajs.",
  topicsLabel: "Topics",
  cta: {
    title: "Did not find your answer?",
    description:
      "Send us your question and our support team will help you out.",
    primary: "Contact support",
    secondary: "Help Center",
  },
};

export function getHelpCopy(): HelpCopy {
  return helpEn;
}

export function getFaqPageCopy(): FaqPageCopy {
  return faqPageEn;
}
