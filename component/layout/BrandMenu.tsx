"use client";

import type { Brand } from "@/app/actions/brand";
import { Dropdown } from "@/component/motion/Dropdown";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BrandMenuProps {
  brands: Brand[];
  label: string;
  className?: string;
}

/**
 * A brand's products. The catalogue has no brand filter of its own, but its
 * search matches brand names — so a brand opens as a search for its name.
 */
export function brandHref(brand: Brand) {
  return `/product?q=${encodeURIComponent(brand.name)}`;
}

/** The header's "Brands" button and the panel of brands it opens. */
export function BrandMenu({ brands, label, className = "" }: BrandMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost flex items-center gap-1 rounded !px-2.5 !py-2 text-sm"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 cursor-default"
        />
      )}

      <Dropdown
        show={open}
        className="absolute start-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-3 shadow-xl"
      >
        {brands.length === 0 ? (
          <p className="px-1 py-2 text-sm text-(--color-text-muted)">
            No brands yet.
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={brandHref(brand)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-(--radius-md) border border-(--color-border) px-2.5 py-2 text-sm font-medium text-(--color-dark) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded object-contain"
                  />
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded bg-(--color-bg) text-xs font-bold">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="truncate">{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
