import { HomeSkeleton } from "@/component/common/Skeletons";

// Shown the moment the homepage is opened (the logo, a "Home" link), while
// the page itself is on its way — so a click is answered at once.
export default function HomeLoading() {
  return <HomeSkeleton />;
}
