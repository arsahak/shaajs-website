import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.privacy,
    description: getLegalDocument("privacy").description,
    alternates: { canonical: "/privacy" },
  };
}

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
