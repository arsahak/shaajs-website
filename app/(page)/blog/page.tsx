import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { BlogList } from "@/component/blog/BlogList";

const DESCRIPTION =
  "Shopping guides, shipping explainers and seller tips from the BongoOcean team.";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.blog,
    description: DESCRIPTION,
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogPage() {
  const dict = await getDictionary();

  return (
    <>
      <PageHero
        title={dict.footer.blog}
        homeLabel={dict.nav.home}
        icon={Newspaper}
        subtitle={DESCRIPTION}
      />
      <BlogList />
    </>
  );
}
