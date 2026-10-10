import type { ReactNode } from "react";
import { FadeIn } from "@/component/motion/FadeIn";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  /** "surface" paints a full-width white band behind the section. */
  tone?: "plain" | "surface";
  children: ReactNode;
}

/** A full-width page band whose content stays inside the site container. */
export function Section({
  id,
  title,
  subtitle,
  tone = "plain",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-8 sm:py-10 ${
        tone === "surface"
          ? "border-y border-(--color-border) bg-(--color-surface)"
          : ""
      }`}
    >
      <div className="container">
        {title && (
          <FadeIn className="mb-6">
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
          </FadeIn>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;
