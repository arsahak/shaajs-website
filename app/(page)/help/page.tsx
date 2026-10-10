import { LifeBuoy } from "lucide-react";
import type { Metadata } from "next";
import { getHelpCopy } from "@/app/data/help-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { HelpContent } from "@/component/help/HelpContent";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.help,
    description: getHelpCopy().description,
    alternates: { canonical: "/help" },
  };
}

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
