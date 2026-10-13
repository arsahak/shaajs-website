// The grey placeholders shown while a page or a part of one is loading —
// each laid out like what it stands in for, so nothing jumps when the real
// content replaces it.

/** One product card: its picture, then two lines of text and a price. */
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

/** A grid of product cards. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** The gradient title banner the inner pages open with. */
function PageBannerSkeleton() {
  return <div className="skeleton h-[5.5rem] rounded-(--radius-2xl) sm:h-24" />;
}

/**
 * Any inner page: its title banner, then a few blocks of content. The
 * stand-in for pages that have no skeleton of their own.
 */
export function PageSkeleton() {
  return (
    <div className="container py-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <PageBannerSkeleton />
      <div className="mt-8 space-y-4">
        <div className="skeleton h-6 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}

/**
 * A product list page (all products, a category): the title banner, the
 * filter sidebar on desktop, and the grid of products.
 */
export function ListingSkeleton() {
  return (
    <div className="container py-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading products…
      </span>
      <PageBannerSkeleton />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_8fr]">
        <div className="hidden space-y-4 lg:block">
          <div className="skeleton h-28 rounded-(--radius-lg)" />
          <div className="skeleton h-72 rounded-(--radius-lg)" />
          <div className="skeleton h-40 rounded-(--radius-lg)" />
        </div>
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="skeleton h-9 w-40 rounded-full" />
            <div className="skeleton h-9 w-32 rounded-full" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

/** The homepage's row of "best for" cards: six squares (three on a phone). */
export function BestForRowSkeleton() {
  return (
    <section className="pt-3 sm:pt-4 lg:pt-5" aria-hidden="true">
      <div className="container">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="skeleton aspect-square rounded-(--radius-lg)"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** The homepage's new arrivals: a heading and a row of tall cards. */
export function NewArrivalsSkeleton() {
  return (
    <section className="py-8 sm:py-10" aria-hidden="true">
      <div className="container">
        <div className="skeleton h-8 w-44 rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="skeleton aspect-[3/4] rounded-(--radius-2xl)"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The homepage as it opens: the hero banner, the row of "best for" cards,
 * and the first products.
 */
export function HomeSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <section className="pt-3 sm:pt-4 lg:pt-5">
        <div className="container">
          {/* The banner, and beside it on desktop the two offer cards. */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-5">
            <div className="skeleton aspect-[12/5] rounded-(--radius-xl) sm:rounded-(--radius-2xl)" />
            <div className="hidden flex-col gap-3 lg:flex">
              <div className="skeleton flex-1 rounded-(--radius-xl)" />
              <div className="skeleton flex-1 rounded-(--radius-xl)" />
            </div>
          </div>
        </div>
      </section>
      <BestForRowSkeleton />
      <section className="pt-3 pb-8 sm:pt-4 sm:pb-10 lg:pt-5">
        <div className="container">
          <div className="skeleton h-8 w-52 rounded-full" />
          <div className="mt-6">
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </section>
    </div>
  );
}
