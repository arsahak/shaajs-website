import { Truck } from "lucide-react";
import type { Metadata } from "next";
// BD-ONLY: parked with the worldwide route panel — see ShippingContent.tsx.
// import { headers } from "next/headers";
import { getShippingCopy } from "@/app/data/shipping-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { ShippingContent } from "@/component/shipping/ShippingContent";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.shipping_info,
    description: getShippingCopy().description,
    alternates: { canonical: "/shipping" },
  };
}

export default async function ShippingPage() {
  const dict = await getDictionary();

  // BD-ONLY: the visitor's country only mattered for the worldwide route panel.
  // // Real visitor location from the hosting edge network, when available (e.g. Vercel).
  // const requestHeaders = await headers();
  // const countryCode = requestHeaders.get("x-vercel-ip-country") ?? "BD";

  return (
    <>
      <PageHero
        title={dict.footer.shipping_info}
        homeLabel={dict.nav.home}
        icon={Truck}
        subtitle={getShippingCopy().description}
      />
      <ShippingContent />
    </>
  );
}
