import { FileText } from "lucide-react";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/terms");

export default async function TermsPage() {
  const dict = await getDictionary();
  const document = getLegalDocument("terms");

  return (
    <>
      <PageHero
        title={dict.footer.terms}
        homeLabel={dict.nav.home}
        icon={FileText}
        subtitle={document.description}
      />
      <LegalDocument document={document} />
    </>
  );
}
