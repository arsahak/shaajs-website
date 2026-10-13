import { RotateCcw } from "lucide-react";
import { getReturnsCopy } from "@/app/data/returns-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { ReturnsContent } from "@/component/returns/ReturnsContent";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/returns");

export default async function ReturnsPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.returns}
        homeLabel={dict.nav.home}
        icon={RotateCcw}
        subtitle={getReturnsCopy().description}
      />
      <ReturnsContent />
    </>
  );
}
