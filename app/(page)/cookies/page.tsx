import { Cookie } from "lucide-react";
import type { Metadata } from "next";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.cookie_policy,
    description: getLegalDocument("cookies").description,
    alternates: { canonical: "/cookies" },
  };
}

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
