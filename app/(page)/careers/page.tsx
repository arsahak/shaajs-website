import { Briefcase } from "lucide-react";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { CareersContent } from "@/component/careers/CareersContent";
import { staticPageMetadata } from "@/app/data/seo";

const DESCRIPTION =
  "Join the team building a marketplace for shoppers and sellers across Bangladesh.";

export const metadata = staticPageMetadata("/careers");

export default async function CareersPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.careers}
        homeLabel={dict.nav.home}
        icon={Briefcase}
        subtitle={DESCRIPTION}
      />
      <CareersContent />
    </>
  );
}
