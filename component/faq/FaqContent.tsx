import { getFaqCategories } from "@/app/data/faq";
import { getFaqPageCopy } from "@/app/data/help-copy";
import { FaqList } from "@/component/content/FaqList";
import { SupportCta } from "@/component/content/SupportCta";

export function FaqContent() {
  // Questions and page text, in the visitor's language.
  const faqCategories = getFaqCategories();
  const copy = getFaqPageCopy();

  return (
    <>
      <section className="py-8 sm:py-10">
        <div className="container grid grid-cols-1 gap-6 lg:grid-cols-[2fr_8fr]">
          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <nav
              aria-label={copy.topicsLabel}
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
            >
              <h2 className="px-1 text-base font-bold">{copy.topicsLabel}</h2>
              <ul className="mt-3 flex list-none flex-col gap-0.5 ps-0 [&>li]:m-0">
                {faqCategories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={`#${category.id}`}
                      className="block rounded-(--radius-md) px-2.5 py-2 text-sm font-medium text-(--color-dark) transition-colors hover:bg-(--color-bg) hover:text-(--color-primary)"
                    >
                      {category.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex flex-col gap-10">
            {faqCategories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24 text-start"
              >
                <h2 className="section-title mb-4">{category.title}</h2>
                <FaqList items={category.items} />
              </section>
            ))}
          </div>
        </div>
      </section>

      <SupportCta
        title={copy.cta.title}
        description={copy.cta.description}
        primary={{ label: copy.cta.primary, href: "/contact" }}
        secondary={{ label: copy.cta.secondary, href: "/help" }}
      />
    </>
  );
}

export default FaqContent;
