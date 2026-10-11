import { formatTaka, insideDhaka, outsideDhaka } from "./delivery";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "orders-payment",
    title: "Orders & Payment",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Add the products you want to your cart, open the cart and choose Proceed to Checkout. Sign in, enter your contact details and delivery address, then confirm the order. You will see an order number as soon as it is placed.",
      },
      {
        question: "Which payment methods can I use?",
        answer:
          "Cash on Delivery is available right now — you pay in cash when the parcel arrives. bKash, Nagad and card payments are being added and will appear at checkout as soon as they are live.",
      },
      {
        question: "Do I need an account to order?",
        answer:
          "Yes. An account lets us attach the order to you, so you can follow its status, see your order history and reach support without repeating your details.",
      },
      {
        question: "Can I change or cancel an order after placing it?",
        answer:
          "Contact support as soon as possible with your order number. Orders that are still pending can usually be changed or cancelled; once an order has shipped it has to go through the returns process instead.",
      },
      {
        question: "Are prices in Bangladeshi Taka?",
        answer:
          "Yes. Every price and delivery fee on Shaajs is shown in Bangladeshi Taka (৳), and that is exactly the amount you pay — there are no conversion charges.",
      },
    ],
  },
  {
    id: "shipping-delivery",
    title: "Shipping & Delivery",
    items: [
      {
        question: "Where do you deliver?",
        answer:
          "All over Bangladesh — every district in all eight divisions: Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur and Mymensingh.",
      },
      {
        question: "How long does delivery take?",
        answer: `Usually ${insideDhaka.days} working days inside Dhaka and ${outsideDhaka.days} working days for the rest of the country. Public holidays, bad weather and remote locations can add a little time.`,
      },
      {
        question: "How much is the delivery fee?",
        answer: `${formatTaka(insideDhaka.fee)} inside Dhaka and ${formatTaka(outsideDhaka.fee)} everywhere else in Bangladesh. The fee is shown in the order summary at checkout before you confirm.`,
      },
      {
        question: "How do I track my order?",
        answer:
          "Open Track Order, sign in and enter your order number. You will see whether the order is pending, processing, shipped or delivered. The same status is always available under My Orders.",
      },
    ],
  },
  {
    id: "returns-refunds",
    title: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "You can request a return within 30 days of delivery if the item is unused, in its original packaging and has all of its accessories and tags.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Contact support with your order number and the reason for the return. We will confirm whether the item is eligible and tell you how to send it back.",
      },
      {
        question: "My item arrived damaged or is not what I ordered. What now?",
        answer:
          "Tell us within 48 hours of delivery and include photos of the item and the packaging. We will arrange a replacement or a refund at no extra cost to you.",
      },
      {
        question: "When will I get my refund?",
        answer:
          "Once the returned item reaches us and passes inspection, the refund is issued within 5–10 business days to your bKash, Nagad or bank account — support confirms the details with you beforehand.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Security",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Choose Sign Up, enter your name, email or phone number and a password. You can update your profile, address and photo at any time from your account page.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "Open Sign In and choose Forgot password. Enter the email on your account and follow the reset link we send you.",
      },
      {
        question: "Is my information safe?",
        answer:
          "Your account is protected by your password and an encrypted connection. We only use your details to process orders and support you — see the Privacy Policy for the full picture.",
      },
    ],
  },
  {
    id: "selling",
    title: "Selling on Shaajs",
    items: [
      {
        question: "Who can sell on Shaajs?",
        answer:
          "Businesses, manufacturers, wholesalers and brand owners in Bangladesh with genuine products. Every seller is reviewed before their store goes live.",
      },
      {
        question: "How do I become a seller?",
        answer:
          "Send us your business details from the Sell on Shaajs page. Our seller team reviews the application and helps you set up your store.",
      },
      {
        question: "What can I not sell?",
        answer:
          "Counterfeit goods, items that are illegal to sell in Bangladesh, and anything unsafe or misleadingly described are not allowed.",
      },
    ],
  },
];

export function getFaqCategories(): FaqCategory[] {
  return faqCategories;
}

export function getFaqCategory(id: string): FaqCategory | undefined {
  return getFaqCategories().find((category) => category.id === id);
}
