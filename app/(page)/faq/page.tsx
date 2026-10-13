import { CircleHelp } from "lucide-react";
import { getFaqPageCopy } from "@/app/data/help-copy";
import { getDictionary } from "@/app/dictionaries";
import { PageHero } from "@/component/common/PageHero";
import { FaqContent } from "@/component/faq/FaqContent";
import { faqCategories } from "@/app/data/faq";
import { staticPageMetadata } from "@/app/data/seo";
import { JsonLd } from "@/component/seo/JsonLd";

export const metadata = staticPageMetadata("/faq");

export default async function FaqPage() {
  const dict = await getDictionary();

  return (
    <>
      {/* Every question with its answer, for search results. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqCategories.flatMap((category) =>
            category.items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          ),
        }}
      />
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
