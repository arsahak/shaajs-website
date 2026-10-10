import { company } from "./company";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocumentData {
  /** Hero subtitle and the page's meta description. */
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "October 7, 2026";

export const termsOfService: LegalDocumentData = {
  description:
    "The rules for using BongoOcean, placing orders and selling on the marketplace.",
  updated: UPDATED,
  intro:
    "These Terms of Service explain the rules for using BongoOcean. By browsing the site, creating an account or placing an order, you agree to them. Please read them carefully.",
  sections: [
    {
      id: "using-bongoocean",
      title: "Using BongoOcean",
      paragraphs: [
        "BongoOcean is an online marketplace where shoppers in Bangladesh can discover and order products from trusted sellers. You may use the site only for lawful purposes and in line with these terms.",
        "You must be old enough to enter into a binding agreement in your country to place an order.",
      ],
    },
    {
      id: "your-account",
      title: "Your account",
      paragraphs: [
        "You are responsible for the accuracy of the details on your account and for keeping your password confidential. Tell us straight away if you think someone else has accessed your account.",
        "We may suspend or close accounts that are used for fraud, abuse or any activity that breaks these terms.",
      ],
    },
    {
      id: "orders-and-pricing",
      title: "Orders and pricing",
      paragraphs: [
        "Placing an order is an offer to buy. The order is accepted once we confirm it. We may decline or cancel an order — for example if an item is out of stock, a price was listed in error, or we cannot verify the delivery details.",
        "All prices are shown in Bangladeshi Taka (৳). The delivery fee for your zone is shown at checkout before you confirm the order.",
      ],
    },
    {
      id: "payment",
      title: "Payment",
      paragraphs: [
        "The payment methods available to you are shown at checkout. With Cash on Delivery you pay the full order amount, including the delivery fee, in cash when the parcel is handed to you.",
      ],
    },
    {
      id: "shipping-and-delivery",
      title: "Shipping and delivery",
      paragraphs: [
        "We currently deliver to addresses within Bangladesh. Delivery estimates are given in good faith but are not guaranteed — public holidays, weather and courier delays can affect them.",
        "Risk in the products passes to you when they are delivered to the address on your order. Please make sure someone is available to receive the parcel and that your phone number is reachable.",
      ],
    },
    {
      id: "returns-and-refunds",
      title: "Returns and refunds",
      paragraphs: [
        "Eligible items can be returned within 30 days of delivery. The full conditions, the steps to follow and the items that cannot be returned are set out in our Returns & Refunds policy, which forms part of these terms.",
      ],
    },
    {
      id: "sellers-and-listings",
      title: "Sellers and product listings",
      paragraphs: [
        "Sellers are responsible for describing their products accurately and for making sure they are genuine and legal to sell. We review sellers before they join, and we remove listings that break our rules.",
      ],
    },
    {
      id: "prohibited-use",
      title: "Prohibited use",
      paragraphs: ["When using BongoOcean you must not:"],
      bullets: [
        "Break any law or infringe anyone else's rights.",
        "Provide false information or impersonate another person or business.",
        "Interfere with the site, attempt to access it without permission, or scrape its content.",
        "Post reviews or messages that are abusive, misleading or unrelated to a real purchase.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "The BongoOcean name, logo, design and content belong to us or our licensors. You may not copy or reuse them without written permission. Product images and descriptions remain the property of the sellers who supplied them.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        "We provide the site on an \"as available\" basis. To the extent the law allows, we are not liable for indirect or consequential losses arising from your use of BongoOcean. Nothing in these terms limits rights you have under consumer protection law.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of Bangladesh, and any dispute will be handled by the courts of Bangladesh.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. The date at the top of the page shows when they last changed. Continuing to use BongoOcean after an update means you accept the new terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        `Questions about these terms can be sent to ${company.legalEmail}.`,
      ],
    },
  ],
};

export const privacyPolicy: LegalDocumentData = {
  description:
    "What personal information BongoOcean collects, why, and the choices you have.",
  updated: UPDATED,
  intro:
    "This Privacy Policy describes what personal information BongoOcean collects, why we collect it and the choices you have. We only collect what we need to run the marketplace and look after your orders.",
  sections: [
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: ["We collect the following kinds of information:"],
      bullets: [
        "Account details — your name, email address, phone number, password and profile photo.",
        "Order details — the products you order, your delivery address (division, district, upazila and street address), delivery zone and any notes you add.",
        "Messages — what you send us when you contact support.",
        "Technical details — basic information your browser sends when you visit, such as your approximate location, which we use to show relevant delivery information.",
      ],
    },
    {
      id: "how-we-use-it",
      title: "How we use your information",
      paragraphs: ["We use your information to:"],
      bullets: [
        "Create and secure your account.",
        "Process, deliver and support your orders.",
        "Answer your questions and resolve problems.",
        "Detect and prevent fraud and misuse.",
      ],
    },
    {
      id: "sharing",
      title: "When we share information",
      paragraphs: [
        "We share only what is needed to fulfil your order — for example your name, phone number and address with the delivery partner bringing your parcel, and the order contents with the seller preparing it.",
        "We do not sell your personal information. We may disclose information when the law requires us to.",
      ],
    },
    {
      id: "storage-and-security",
      title: "Storage and security",
      paragraphs: [
        "Your data is sent over an encrypted connection and passwords are never stored in readable form. No system is perfectly secure, so please use a strong password and keep it private.",
        "Your cart, wishlist and theme choice are stored in your own browser so they are still there on your next visit.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      paragraphs: [
        "We keep account and order information for as long as your account is open and for as long afterwards as we need it to meet legal, tax and accounting obligations.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights and choices",
      paragraphs: [
        "You can view and update your profile from your account page at any time. You can also ask us for a copy of your information, to correct it, or to delete your account.",
        `To make a request, email ${company.supportEmail} from the address on your account.`,
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "We only use the cookies needed to keep you signed in and remember your language. Our Cookie Policy explains them.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "BongoOcean is not intended for children, and we do not knowingly collect personal information from them.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "If we change how we handle personal information we will update this page and the date at the top of it.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        `For any privacy question, email ${company.legalEmail}.`,
      ],
    },
  ],
};

export const cookiePolicy: LegalDocumentData = {
  description:
    "The cookies and browser storage BongoOcean uses, and how to control them.",
  updated: UPDATED,
  intro:
    "This Cookie Policy explains what cookies and similar browser storage BongoOcean uses and how you can control them.",
  sections: [
    {
      id: "what-are-cookies",
      title: "What cookies are",
      paragraphs: [
        "Cookies are small text files a website saves in your browser. They let the site remember you between pages and visits. Browser storage works in a similar way but stays entirely on your device.",
      ],
    },
    {
      id: "cookies-we-use",
      title: "Cookies we use",
      paragraphs: [
        "We keep cookies to the essentials needed for the site to work:",
      ],
      bullets: [
        "Sign-in session — keeps you signed in while you shop and check out.",
      ],
    },
    {
      id: "browser-storage",
      title: "Preferences stored in your browser",
      paragraphs: [
        "A few choices are saved in your browser's local storage rather than in cookies. They never leave your device:",
      ],
      bullets: [
        "The items in your cart and wishlist.",
        "Your light or dark theme.",
      ],
    },
    {
      id: "advertising",
      title: "Advertising and tracking",
      paragraphs: [
        "We do not use advertising cookies or sell browsing data. If we introduce analytics or marketing cookies in the future, we will update this policy and ask for your consent where the law requires it.",
      ],
    },
    {
      id: "managing-cookies",
      title: "Managing cookies",
      paragraphs: [
        "You can clear or block cookies in your browser settings. If you block the essential cookies you will not be able to stay signed in or place an order, and your language choice will not be remembered.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        `Questions about cookies can be sent to ${company.legalEmail}.`,
      ],
    },
  ],
};

export type LegalDocumentKind = "terms" | "privacy" | "cookies";

const legalDocuments: Record<LegalDocumentKind, LegalDocumentData> = {
  terms: termsOfService,
  privacy: privacyPolicy,
  cookies: cookiePolicy,
};

export function getLegalDocument(kind: LegalDocumentKind): LegalDocumentData {
  return legalDocuments[kind];
}
