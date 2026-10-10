import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { CareersContent } from "@/component/careers/CareersContent";

const DESCRIPTION =
  "Join the team building a marketplace for shoppers and sellers across Bangladesh.";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.careers,
    description: DESCRIPTION,
    alternates: { canonical: "/careers" },
  };
}

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
