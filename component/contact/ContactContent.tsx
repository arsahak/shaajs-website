import { company } from "@/app/data/company";
import type { ContactTopic } from "@/app/data/contact";
import { ContactForm } from "@/component/contact/ContactForm";
import { Section } from "@/component/content/Section";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  Clock,
  LifeBuoy,
  Mail,
  PackageSearch,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface ContactContentProps {
  initialTopic?: ContactTopic;
  /** Signed-in customer's name and email, used to pre-fill the form. */
  defaultName?: string;
  defaultEmail?: string;
}

interface Channel {
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
}

export function ContactContent({
  initialTopic,
  defaultName,
  defaultEmail,
}: ContactContentProps) {
  const channels: Channel[] = [
    {
      icon: Mail,
      title: "Customer support",
      detail: company.supportEmail,
      href: `mailto:${company.supportEmail}`,
    },
    {
      icon: Store,
      title: "Seller enquiries",
      detail: company.sellerEmail,
      href: `mailto:${company.sellerEmail}`,
    },
    {
      icon: PackageSearch,
      title: "Track an order",
      detail: "Check your order status",
      href: "/orders/track",
    },
    {
      icon: LifeBuoy,
      title: "Help Center",
      detail: "Guides and quick answers",
      href: "/help",
    },
  ];

  return (
    <>
      <Section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[4fr_6fr]">
          <FadeIn className="flex flex-col gap-3">
            {channels.map((channel) => (
              <Link
                key={channel.title}
                href={channel.href}
                className="flex items-center gap-4 rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-5 text-start transition-colors hover:border-(--color-primary)"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
                  <channel.icon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-(--color-dark)">
                    {channel.title}
                  </span>
                  <span className="block truncate text-sm text-(--color-text-muted)">
                    {channel.detail}
                  </span>
                </span>
              </Link>
            ))}

            <div className="flex items-center gap-4 rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-5 text-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
                <Clock size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--color-dark)">
                  Support hours
                </span>
                <span className="block text-sm text-(--color-text-muted)">
                  {company.supportHours} — real help, round the clock
                </span>
              </span>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.05}
            className="rounded-(--radius-2xl) border border-(--color-border) bg-(--color-surface) p-6 sm:p-8"
          >
            <h2 className="section-title text-start">Send us a message</h2>
            <p className="section-subtitle mt-1 mb-6 text-start">
              Tell us what you need and include your order number if you have
              one — it helps us answer faster.
            </p>
            <ContactForm
              initialTopic={initialTopic}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </FadeIn>
        </div>
      </Section>

      <SupportCta
        title="Need an answer right now?"
        description="Most questions about orders, delivery and returns are already answered in our FAQ."
        primary={{ label: "Browse the FAQ", href: "/faq" }}
      />
    </>
  );
}

export default ContactContent;
