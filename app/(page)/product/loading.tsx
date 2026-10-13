import { ListingSkeleton } from "@/component/common/Skeletons";

// Shown while the product list is on its way. (A single product's page has
// its own, in [slug]/loading.tsx.)
export default function ProductListLoading() {
  return <ListingSkeleton />;
}
