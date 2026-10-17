import { BD_DIVISIONS } from "./checkout";

export interface DeliveryZoneInfo {
  name: string;
  /** Delivery fee in BDT. */
  fee: number;
  /** Estimated delivery window, in working days. */
  days: string;
  description: string;
}

// Fees mirror backend createOrder (and CheckoutDetails.deliveryFeeFor): ৳65
// for Dhaka division + "Inside Dhaka", ৳115 everywhere else. The backend's
// figure is what is actually charged — keep these in step with it.
export const deliveryZones: DeliveryZoneInfo[] = [
  {
    name: "Inside Dhaka",
    fee: 65,
    days: "1–3",
    description: "Dhaka city and nearby areas — choose Dhaka division and the Inside Dhaka zone at checkout.",
  },
  {
    name: "Outside Dhaka",
    fee: 115,
    days: "3–5",
    description: `Everywhere else in Bangladesh, across all ${BD_DIVISIONS.length} divisions.`,
  },
];

export const [insideDhaka, outsideDhaka] = deliveryZones;

export function formatTaka(amount: number) {
  return `৳${amount}`;
}
