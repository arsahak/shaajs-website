import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface PageHeroProps {
  title: string;
  homeLabel: string;
  icon: LucideIcon;
  subtitle?: string;
  /** Breadcrumb steps between Home and the current page. */
  parents?: { label: string; href: string }[];
}

/** The gradient title banner + breadcrumb shared by the inner pages. */
export function PageHero({
  title,
  homeLabel,
  icon: Icon,
  subtitle,
  parents = [],
}: PageHeroProps) {
  return (
    <div className="container pt-8">
      <div className="relative overflow-hidden rounded-(--radius-2xl) bg-linear-to-br from-(--color-primary) to-(--color-primary-light) px-6 py-5 sm:px-8 sm:py-6">
        <div className="relative z-10">
          <h1 className="text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm text-white/80">{subtitle}</p>
          )}
          <nav
            aria-label="Breadcrumb"
            className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-white/70"
          >
            <Link
              href="/"
              className="text-white/70 transition-colors hover:text-white"
            >
              {homeLabel}
            </Link>
            {parents.map((parent) => (
              <span key={parent.href} className="flex items-center gap-1.5">
                <ChevronRight size={12} />
                <Link
                  href={parent.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {parent.label}
                </Link>
              </span>
            ))}
            <ChevronRight size={12} />
            <span>{title}</span>
          </nav>
        </div>

        <Icon
          aria-hidden="true"
          strokeWidth={1}
          size={110}
          className="pointer-events-none absolute end-[-1rem] bottom-[-1rem] text-white/15"
        />
      </div>
    </div>
  );
}

export default PageHero;
