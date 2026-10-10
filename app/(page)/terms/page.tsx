import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { getLegalDocument } from "@/app/data/legal";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { LegalDocument } from "@/component/content/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.terms,
    description: getLegalDocument("terms").description,
    alternates: { canonical: "/terms" },
  };
}

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
