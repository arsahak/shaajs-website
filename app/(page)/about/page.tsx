import { getDictionary } from "@/app/dictionaries";
import { AboutContent } from "@/component/about/AboutContent";
import { PageHero } from "@/component/common/PageHero";
import { Info } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

const DESCRIPTION =
  "Shaajs is an online marketplace for Bangladesh — trusted sellers, cash on delivery and nationwide shipping.";

export const metadata = staticPageMetadata("/about");

export default async function AboutPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.about}
        homeLabel={dict.nav.home}
        icon={Info}
        subtitle={DESCRIPTION}
      />
      <AboutContent />
    </>
  );
}
