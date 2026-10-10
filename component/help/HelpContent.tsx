import { getFaqCategories } from "@/app/data/faq";
import { getHelpCopy } from "@/app/data/help-copy";
import { FaqList } from "@/component/content/FaqList";
import { Section } from "@/component/content/Section";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  ArrowRight,
  CircleHelp,
  PackageSearch,
  RotateCcw,
  Store,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

// Icon and destination for each topic card, in the same order as the copy's
// topic items (app/data/help-copy.ts).
const TOPIC_LINKS: { icon: LucideIcon; path: string }[] = [
  { icon: PackageSearch, path: "/orders/track" },
  { icon: Truck, path: "/shipping" },
  { icon: RotateCcw, path: "/returns" },
  { icon: UserRound, path: "/account" },
  { icon: Store, path: "/sell" },
  { icon: CircleHelp, path: "/faq" },
];

export function HelpContent() {
  // All of the page's text, in the visitor's language.
  const copy = getHelpCopy();
  const topics = copy.topics.items.map((item, i) => ({
    ...item,
    icon: TOPIC_LINKS[i].icon,
    href: TOPIC_LINKS[i].path,
  }));

  // The first question of each FAQ group makes a good "most asked" shortlist.
  const popular = getFaqCategories().map((category) => category.items[0]);

  return (
    <>
      <Section
        title={copy.topics.title}
        subtitle={copy.topics.subtitle}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, i) => (
            <FadeIn key={topic.title} delay={Math.min(i, 4) * 0.05}>
              <Link
                href={topic.href}
                className="group flex h-full items-start gap-4 rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-6 text-start transition-colors hover:border-(--color-primary)"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
                  <topic.icon size={20} />
                </span>
                <span className="flex-1">
                  <span className="block font-(family-name:--font-heading) font-semibold text-(--color-dark)">
                    {topic.title}
                  </span>
                  <span className="mt-1 block text-sm text-(--color-text-muted)">
                    {topic.description}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  size={16}
                  className="mt-1 shrink-0 text-(--color-text-light) transition-all group-hover:translate-x-1 group-hover:text-(--color-primary)"
                />
              </Link>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section
        title={copy.popular.title}
        subtitle={copy.popular.subtitle}
      >
        <FaqList items={popular} />
        <Link
          href="/faq"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
        >
          {copy.popular.viewAll}
          <ArrowRight size={16} />
        </Link>
      </Section>

      <SupportCta
        title={copy.cta.title}
        description={copy.cta.description}
        primary={{ label: copy.cta.primary, href: "/contact" }}
      />
    </>
  );
}

export default HelpContent;
