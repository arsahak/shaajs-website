/** Formats a price in Bangladeshi Taka, the store's only currency: `৳1,430`. */
export function formatPrice(amount: number): string {
  return `৳${new Intl.NumberFormat("en", {
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount)}`;
}
