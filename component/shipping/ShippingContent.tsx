import { BD_DIVISIONS } from "@/app/data/checkout";
import { getShippingCopy } from "@/app/data/shipping-copy";
import { FaqList } from "@/component/content/FaqList";
import { FeatureGrid } from "@/component/content/FeatureGrid";
import { Section } from "@/component/content/Section";
import { StepList } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  Banknote,
  Clock,
  MapPin,
  PackageSearch,
  PhoneCall,
  Truck,
  type LucideIcon,
} from "lucide-react";
// BD-ONLY: the Bangladesh launch delivers within Bangladesh only, so the
// worldwide air/sea route panel is parked. Restore it (and the `countryCode`
// prop + the header lookup in app/(page)/shipping/page.tsx) when
// international shipping opens.
// import { ShippingRoute } from "@/component/shipping/ShippingRoute";

// Icons for the "Good to know" cards, in the same order as the copy's items:
// cash on delivery, phone, address, tracking.
const GOOD_TO_KNOW_ICONS: LucideIcon[] = [
  Banknote,
  PhoneCall,
  MapPin,
  PackageSearch,
];

export function ShippingContent() {
  // All of the page's text (app/data/shipping-copy.ts).
  const copy = getShippingCopy();

  return (
    <>
      {/* BD-ONLY: parked worldwide route panel — see the import above.
      <ShippingRoute countryCode={countryCode} />
      */}

      <Section
        title={copy.zones.title}
        subtitle={copy.zones.subtitle}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {copy.zones.items.map((zone, i) => (
            <FadeIn
              key={zone.name}
              delay={i * 0.05}
              className="rounded-(--radius-2xl) border border-(--color-border) bg-(--color-surface) p-6 text-start sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
                    <Truck size={20} />
                  </span>
                  <h3 className="text-xl">{zone.name}</h3>
                </div>
                <span className="badge badge-primary">{zone.workingDays}</span>
              </div>

              <p className="mt-4 text-sm text-(--color-text-muted)">
                {zone.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-(--color-border) pt-6">
                <div>
                  <p className="text-xs text-(--color-text-muted)">
                    {copy.zones.feeLabel}
                  </p>
                  <p className="font-(family-name:--font-heading) text-2xl font-extrabold text-(--color-primary)">
                    {zone.fee}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--color-text-muted)">
                    {copy.zones.estimateLabel}
                  </p>
                  <p className="flex items-center gap-1.5 font-(family-name:--font-heading) text-2xl font-extrabold text-(--color-dark)">
                    <Clock size={18} className="text-(--color-text-light)" />
                    {zone.days}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section
        tone="surface"
        title={copy.coverage.title}
        subtitle={copy.coverage.subtitle}
      >
        <FadeIn>
          <ul className="flex list-none flex-wrap gap-2 ps-0 [&>li]:m-0">
            {BD_DIVISIONS.map((division) => (
              <li
                key={division}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-bg) px-4 py-2 text-sm font-medium text-(--color-dark)"
              >
                <MapPin size={14} className="text-(--color-primary)" />
                {copy.coverage.divisions[division]}
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section title={copy.steps.title} subtitle={copy.steps.subtitle}>
        <StepList steps={copy.steps.items} />
      </Section>

      <Section title={copy.goodToKnow.title}>
        <FeatureGrid
          items={copy.goodToKnow.items.map((item, i) => ({
            ...item,
            icon: GOOD_TO_KNOW_ICONS[i],
          }))}
          columns={4}
        />
      </Section>

      {copy.faq.items.length > 0 && (
        <Section title={copy.faq.title}>
          <FaqList items={copy.faq.items} />
        </Section>
      )}

      <SupportCta
        title={copy.cta.title}
        description={copy.cta.description}
        primary={{ label: copy.cta.primary, href: "/orders/track" }}
        secondary={{ label: copy.cta.secondary, href: "/contact" }}
      />
    </>
  );
}

export default ShippingContent;
