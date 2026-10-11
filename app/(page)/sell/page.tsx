import { getSellCopy } from "@/app/data/sell-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { SellContent } from "@/component/sell/SellContent";
import { Store } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.topbar.sell_on_Shaajs,
    description: getSellCopy().description,
    alternates: { canonical: "/sell" },
  };
}

export default async function SellPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.topbar.sell_on_Shaajs}
        homeLabel={dict.nav.home}
        icon={Store}
        subtitle={getSellCopy().description}
      />
      <SellContent />
    </>
  );
}
