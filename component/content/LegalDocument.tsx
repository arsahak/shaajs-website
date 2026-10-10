import type { LegalDocumentData } from "@/app/data/legal";

const labels = { onThisPage: "On this page", lastUpdated: "Last updated" };

/** Long-form policy page: sticky table of contents beside the numbered sections. */
export function LegalDocument({
  document,
}: {
  document: LegalDocumentData;
}) {
  const sectionNumber = (index: number) => String(index + 1);

  return (
    <section className="py-8 sm:py-10">
      <div className="container grid grid-cols-1 gap-6 lg:grid-cols-[2fr_8fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav
            aria-label={labels.onThisPage}
            className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
          >
            <h2 className="px-1 text-base font-bold">{labels.onThisPage}</h2>
            <ol className="mt-3 flex list-none flex-col gap-0.5 ps-0 [&>li]:m-0">
              {document.sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-(--radius-md) px-2.5 py-2 text-sm text-(--color-text-muted) transition-colors hover:bg-(--color-bg) hover:text-(--color-primary)"
                  >
                    {sectionNumber(i)}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="rounded-(--radius-2xl) border border-(--color-border) bg-(--color-surface) p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-(--color-text-light) uppercase">
            {labels.lastUpdated}: {document.updated}
          </p>
          <p className="mt-3 text-(--color-text-muted)">{document.intro}</p>

          {document.sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="mt-8 scroll-mt-24 border-t border-(--color-border) pt-8"
            >
              <h2 className="text-xl">
                {sectionNumber(i)}. {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm text-(--color-text-muted)"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc text-sm text-(--color-text-muted)">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </section>
  );
}

export default LegalDocument;
