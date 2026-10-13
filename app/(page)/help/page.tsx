import { LifeBuoy } from "lucide-react";
import { getHelpCopy } from "@/app/data/help-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { HelpContent } from "@/component/help/HelpContent";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/help");

export default async function HelpPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.help}
        homeLabel={dict.nav.home}
        icon={LifeBuoy}
        subtitle={getHelpCopy().description}
      />
      <HelpContent />
    </>
  );
}
