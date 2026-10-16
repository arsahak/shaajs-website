"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavCategory } from "@/app/data/categories";
import { Dropdown } from "@/component/motion/Dropdown";
import { megaMenuVariants } from "@/component/motion/variants";

interface MegaMenuProps {
  category: NavCategory;
  show: boolean;
  /** Runs when a link is followed, so the navbar can close the menu. */
  onNavigate?: () => void;
}

const badgeClass: Record<string, string> = {
  new: "badge-success",
  hot: "badge-hot",
  sale: "badge-sale",
};

export function MegaMenu({ category, show, onNavigate }: MegaMenuProps) {
  return (
    <Dropdown
      show={show}
      variants={megaMenuVariants}
      // Tall menus (many columns) scroll inside the panel instead of running
      // off the bottom of a short screen.
      className="absolute inset-x-0 top-full z-30 max-h-[calc(100dvh-10rem)] overflow-y-auto border-t border-(--color-border) bg-(--color-surface) shadow-xl"
    >
      <div className="container grid grid-cols-1 gap-10 py-8 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {category.columns.map((column) => (
            <div key={column.title}>
              <h6 className="mb-3">{column.title}</h6>
              <div className="flex flex-col items-start gap-2.5">
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className="inline-flex items-center gap-2 text-sm text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
                  >
                    {link.label}
                    {link.badge && (
                      <span className={`badge ${badgeClass[link.badge]}`}>{link.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* The category's promotion: a brand-colored card with its own
            call to action. It keeps its own height rather than stretching to
            a tall menu's, and stays in view while a long menu scrolls. */}
        <div className="relative isolate flex min-h-60 flex-col self-start overflow-hidden rounded-(--radius-xl) bg-linear-to-br from-(--color-primary) to-(--color-primary-dark) p-6 text-white shadow-lg lg:sticky lg:top-8">
          {/* Soft circles, for depth. */}
          <span
            aria-hidden="true"
            className="absolute -top-12 -right-10 -z-10 h-40 w-40 rounded-full bg-white/10"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-16 -left-10 -z-10 h-44 w-44 rounded-full bg-white/10"
          />

          <span className="w-fit rounded-(--radius-pill) bg-white/20 px-2.5 py-1 text-[11px] leading-none font-semibold tracking-wide text-white uppercase">
            {category.label}
          </span>
          <h4 className="mt-4 text-xl leading-snug font-bold text-white">
            {category.promo.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {category.promo.subtitle}
          </p>
          <Link
            href={category.promo.href}
            onClick={onNavigate}
            className="group/cta mt-auto inline-flex w-fit items-center gap-2 rounded-(--radius-pill) bg-white px-4 py-2 text-sm font-semibold text-(--color-primary) shadow-sm transition-colors hover:bg-white/90 hover:text-(--color-primary-dark)"
          >
            {category.promo.cta}
            <ArrowRight
              size={16}
              className="transition-transform group-hover/cta:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </Dropdown>
  );
}
