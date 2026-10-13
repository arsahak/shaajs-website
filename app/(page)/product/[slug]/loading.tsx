// Shown the moment a product is opened, while its page loads — laid out like
// the page itself (breadcrumb, gallery, details) so nothing jumps when the
// real content replaces it.
export default function ProductDetailLoading() {
  return (
    <div className="container py-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading product…
      </span>

      <div className="skeleton h-4 w-56 max-w-full rounded-full" />

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid gap-3 lg:grid-cols-[4.5rem_minmax(0,1fr)]">
          <div className="skeleton aspect-square w-full max-w-[18rem] rounded-(--radius-2xl) max-lg:mx-auto sm:max-w-md lg:order-2 lg:max-w-none" />
          <div className="flex gap-2.5 max-lg:justify-center lg:order-1 lg:flex-col">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton aspect-square w-16 shrink-0 rounded-(--radius-md) lg:w-full"
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton mt-3 h-7 w-full rounded-full" />
          <div className="skeleton mt-2 h-7 w-2/3 rounded-full" />
          <div className="skeleton mt-4 h-4 w-48 rounded-full" />

          <div className="skeleton mt-6 h-9 w-40 rounded-full" />

          <div className="mt-6 space-y-2.5">
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-3/4 rounded-full" />
          </div>

          <div className="mt-8 flex gap-3">
            <div className="skeleton h-12 flex-1 rounded-(--radius-md)" />
            <div className="skeleton h-12 flex-1 rounded-(--radius-md)" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 flex gap-3">
        <div className="skeleton h-10 w-28 rounded-full" />
        <div className="skeleton h-10 w-28 rounded-full" />
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-1/2 rounded-full" />
      </div>
    </div>
  );
}
