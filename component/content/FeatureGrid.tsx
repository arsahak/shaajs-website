import type { LucideIcon } from "lucide-react";
import { FadeIn } from "@/component/motion/FadeIn";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const COLUMN_CLASS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

interface FeatureGridProps {
  items: Feature[];
  columns?: keyof typeof COLUMN_CLASS;
  /** Use on a "surface" section so the cards still stand out from the band. */
  muted?: boolean;
}

export function FeatureGrid({
  items,
  columns = 3,
  muted = false,
}: FeatureGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${COLUMN_CLASS[columns]}`}>
      {items.map((item, i) => (
        <FadeIn
          key={item.title}
          delay={Math.min(i, 4) * 0.05}
          className={`rounded-(--radius-xl) border border-(--color-border) p-6 ${
            muted ? "bg-(--color-bg)" : "bg-(--color-surface)"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
            <item.icon size={20} />
          </span>
          <h3 className="mt-4 text-base">{item.title}</h3>
          <p className="mt-1.5 text-sm text-(--color-text-muted)">
            {item.description}
          </p>
        </FadeIn>
      ))}
    </div>
  );
}

export default FeatureGrid;
