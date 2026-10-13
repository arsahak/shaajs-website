import { Cookie } from "lucide-react";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/cookies");

export default async function CookiesPage() {
  const dict = await getDictionary();
  const document = getLegalDocument("cookies");

  return (
    <>
      <PageHero
        title={dict.footer.cookie_policy}
        homeLabel={dict.nav.home}
        icon={Cookie}
        subtitle={document.description}
      />
      <LegalDocument document={document} />
    </>
  );
}
