import { CircleHelp } from "lucide-react";
import type { Metadata } from "next";
import { getFaqPageCopy } from "@/app/data/help-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { FaqContent } from "@/component/faq/FaqContent";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.faq,
    description: getFaqPageCopy().description,
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.faq}
        homeLabel={dict.nav.home}
        icon={CircleHelp}
        subtitle={getFaqPageCopy().description}
      />
      <FaqContent />
    </>
  );
}
