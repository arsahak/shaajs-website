import { RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import { getReturnsCopy } from "@/app/data/returns-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { ReturnsContent } from "@/component/returns/ReturnsContent";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.returns,
    description: getReturnsCopy().description,
    alternates: { canonical: "/returns" },
  };
}

export default async function ReturnsPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.returns}
        homeLabel={dict.nav.home}
        icon={RotateCcw}
        subtitle={getReturnsCopy().description}
      />
      <ReturnsContent />
    </>
  );
}
