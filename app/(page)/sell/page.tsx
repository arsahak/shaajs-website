import { getSellCopy } from "@/app/data/sell-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { SellContent } from "@/component/sell/SellContent";
import { Store } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/sell");

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
