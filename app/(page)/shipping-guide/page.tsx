import SecureShipping from "@/component/home/SecureShipping";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/shipping-guide");

export default function ShippingGuidePage() {
  return (
    <div className="container py-10">
      <SecureShipping />
    </div>
  );
}
