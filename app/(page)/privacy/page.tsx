import { ShieldCheck } from "lucide-react";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/privacy");

export default async function PrivacyPage() {
  const dict = await getDictionary();
  const document = getLegalDocument("privacy");

  return (
    <>
      <PageHero
        title={dict.footer.privacy}
        homeLabel={dict.nav.home}
        icon={ShieldCheck}
        subtitle={document.description}
      />
      <LegalDocument document={document} />
    </>
  );
}
