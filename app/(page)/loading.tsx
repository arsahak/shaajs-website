import { PageSkeleton } from "@/component/common/Skeletons";

// Shown the moment any page is opened, while it is on its way from the
// server — so a click on a link is answered at once instead of the old page
// sitting there until the new one is ready. It is also what lets Next.js
// fetch a page's frame ahead of the click. Pages with a shape of their own
// (the homepage, product lists, a product) have their own loading file.
export default function PageLoading() {
  return <PageSkeleton />;
}
