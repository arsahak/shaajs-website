import { getReturnsCopy } from "@/app/data/returns-copy";
import { FaqList } from "@/component/content/FaqList";
import { FeatureGrid } from "@/component/content/FeatureGrid";
import { Section } from "@/component/content/Section";
import { StepList } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  CalendarDays,
  Check,
  PackageCheck,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

// Icons for the three highlight cards, in the same order as the copy's items:
// return window, damaged or wrong item, refund timing.
const HIGHLIGHT_ICONS: LucideIcon[] = [CalendarDays, PackageCheck, Wallet];

function PolicyList({
  title,
  items,
  allowed,
}: {
  title: string;
  items: string[];
  allowed: boolean;
}) {
  const Icon = allowed ? Check : X;

  return (
    <div className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-bg) p-6 text-start">
      <h3 className="text-lg">{title}</h3>
      <ul className="mt-4 flex list-none flex-col gap-3 ps-0 [&>li]:m-0">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                allowed ? "bg-(--color-success)" : "bg-(--color-error)"
              }`}
            >
              <Icon size={12} strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReturnsContent() {
  // All of the page's text, in the visitor's language (app/data/returns-copy.ts).
  const copy = getReturnsCopy();

  return (
    <>
      <Section
        title={copy.highlights.title}
        subtitle={copy.highlights.subtitle}
      >
        <FeatureGrid
          items={copy.highlights.items.map((item, i) => ({
            ...item,
            icon: HIGHLIGHT_ICONS[i],
          }))}
        />
      </Section>

      <Section
        tone="surface"
        title={copy.policy.title}
        subtitle={copy.policy.subtitle}
      >
        <FadeIn className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PolicyList
            title={copy.policy.eligibleTitle}
            items={copy.policy.eligible}
            allowed
          />
          <PolicyList
            title={copy.policy.notEligibleTitle}
            items={copy.policy.notEligible}
            allowed={false}
          />
        </FadeIn>
      </Section>

      <Section title={copy.steps.title} subtitle={copy.steps.subtitle}>
        <StepList steps={copy.steps.items} />
      </Section>

      {copy.faq.items.length > 0 && (
        <Section title={copy.faq.title}>
          <FaqList items={copy.faq.items} />
        </Section>
      )}

      <SupportCta
        title={copy.cta.title}
        description={copy.cta.description}
        primary={{
          label: copy.cta.primary,
          href: "/contact?topic=returns",
        }}
        secondary={{
          label: copy.cta.secondary,
          href: "/orders/track",
        }}
      />
    </>
  );
}

export default ReturnsContent;
