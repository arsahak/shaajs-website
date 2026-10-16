import { listBestForAction } from "@/app/actions/bestFor";
import {
  BestForCards,
  type BestForCard,
} from "@/component/home/BestForCards";

// The card's own color when it was saved without one.
const FALLBACK_COLORS: [string, string] = ["#ff7aa2", "#d10043"];

/**
 * The homepage's row of "best for" cards: the options pinned in the shop's
 * Best For list — who or what a product is best for, kept in the dashboard —
 * and every option of a pinned group, shown six at a time. With nothing
 * pinned, the row is left out altogether.
 */
export async function BestForGrid() {
  const res = await listBestForAction();
  const entries = res.ok ? (res.data ?? []) : [];

  const groups = entries.filter((entry) => !entry.parent);
  const groupNames = new Map(groups.map((group) => [group._id, group.name]));
  const pinnedGroups = new Set(
    groups.filter((group) => group.isPinned).map((group) => group._id),
  );
  const options = entries.filter(
    (entry) =>
      entry.parent &&
      groupNames.has(entry.parent) &&
      (entry.isPinned || pinnedGroups.has(entry.parent)),
  );
  if (options.length === 0) return null;

  // The list's own order runs across the groups (each group's first option,
  // then each one's second, …), so a row mixes kinds. Options that already
  // have products to show go ahead of the ones that don't.
  const cards: BestForCard[] = [
    ...options.filter((option) => (option.productCount ?? 0) > 0),
    ...options.filter((option) => (option.productCount ?? 0) === 0),
  ].map((option) => ({
    id: option._id,
    name: option.name,
    groupName: groupNames.get(option.parent as string) ?? "",
    // The product list, narrowed to what the card stands for.
    href: `/product?bestFor=${encodeURIComponent(option.slug)}`,
    icon: option.icon,
    image: option.image || undefined,
    colors:
      option.colors?.length === 2
        ? [option.colors[0], option.colors[1]]
        : FALLBACK_COLORS,
  }));

  return (
    <section className="pt-3 sm:pt-4 lg:pt-5">
      <div className="container">
        <BestForCards cards={cards} />
      </div>
    </section>
  );
}

export default BestForGrid;
