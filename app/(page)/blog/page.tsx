import { getDictionary } from "@/app/dictionaries";
import { BlogList } from "@/component/blog/BlogList";
import { PageHero } from "@/component/common/PageHero";
import { Newspaper } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

const DESCRIPTION =
  "Shopping guides, shipping explainers and seller tips from the Shaajs team.";

export const metadata = staticPageMetadata("/blog");

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
