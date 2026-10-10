import type { FaqItem } from "@/app/data/faq";

/** Expandable question list — relies on the global <details>/<summary> styles. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.question} className="bg-(--color-surface)">
          <summary className="text-sm sm:text-base">{item.question}</summary>
          <p className="mt-3 text-sm text-(--color-text-muted)">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
