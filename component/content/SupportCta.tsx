import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/component/motion/FadeIn";

interface CtaLink {
  label: string;
  href: string;
}

interface SupportCtaProps {
  title: string;
  description: string;
  primary: CtaLink;
  secondary?: CtaLink;
}

/** Closing call-to-action band used at the bottom of the content pages. */
export function SupportCta({
  title,
  description,
  primary,
  secondary,
}: SupportCtaProps) {
  return (
    <section className="py-8 sm:py-10">
      <div className="container">
        <FadeIn className="relative isolate overflow-hidden rounded-(--radius-2xl) bg-linear-to-br from-(--color-primary-dark) via-(--color-primary) to-(--color-secondary-dark) px-6 py-10 sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-24 -top-24 -z-10 h-72 w-72 rounded-full bg-(--color-secondary) opacity-40 blur-3xl"
          />
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="text-start">
              <h2 className="text-2xl text-white sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-xl text-white/80">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={primary.href}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-(--color-primary) transition-transform duration-300 hover:-translate-y-0.5"
              >
                {primary.label}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                />
              </Link>
              {secondary && (
                <Link
                  href={secondary.href}
                  className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default SupportCta;
