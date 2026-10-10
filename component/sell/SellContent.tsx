import { getSellCopy } from "@/app/data/sell-copy";
import { FaqList } from "@/component/content/FaqList";
import { FeatureGrid } from "@/component/content/FeatureGrid";
import { Section } from "@/component/content/Section";
import { StepList } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  Check,
  Headset,
  MapPin,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

// Icons for the four benefit cards, in the same order as the copy's items:
// reach, delivery, trusted storefront, seller team.
const BENEFIT_ICONS: LucideIcon[] = [MapPin, Truck, ShieldCheck, Headset];

export function SellContent() {
  // All of the page's text, in the visitor's language (app/data/sell-copy.ts).
  const copy = getSellCopy();

  return (
    <>
      <Section
        title={copy.benefits.title}
        subtitle={copy.benefits.subtitle}
      >
        <FeatureGrid
          items={copy.benefits.items.map((item, i) => ({
            ...item,
            icon: BENEFIT_ICONS[i],
          }))}
          columns={4}
        />
      </Section>

      <Section tone="surface">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <FadeIn className="text-start">
            <h2 className="section-title">{copy.requirements.title}</h2>
            <p className="section-subtitle mt-1">
              {copy.requirements.subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <ul className="flex list-none flex-col gap-3 ps-0 [&>li]:m-0">
              {copy.requirements.items.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) p-4 text-start text-sm text-(--color-text)"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {requirement}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
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
          href: "/contact?topic=seller",
        }}
        secondary={{
          label: copy.cta.secondary,
          href: "/blog/start-selling-on-bongoocean",
        }}
      />
    </>
  );
}

export default SellContent;
