import { Suspense } from "react";
import { staticPageMetadata } from "@/app/data/seo";
import { getDictionary } from "@/app/dictionaries";
import {
  BestForRowSkeleton,
  NewArrivalsSkeleton,
} from "@/component/common/Skeletons";
import { BestForGrid } from "@/component/home/BestForGrid";
import { FeaturedProducts } from "@/component/home/FeaturedProducts";
import { HeroSection } from "@/component/home/HeroSection";
import { NewArrivals } from "@/component/home/NewArrivals";
import SecureShipping from "@/component/home/SecureShipping";
import { SellerBanner } from "@/component/home/SellerBanner";

export const metadata = staticPageMetadata("/");

// (This page sits in its own "(home)" folder — which doesn't change its
// address — so it can have a loading skeleton shaped like the homepage.)
export default async function Home() {
  const dict = await getDictionary();

  return (
    <>
      <HeroSection dict={dict} />
      {/* The two sections that wait on the catalogue are sent as they become
          ready, each behind its own placeholder — so the page itself opens
          at once instead of waiting for the slowest of them. */}
      <Suspense fallback={<BestForRowSkeleton />}>
        <BestForGrid />
      </Suspense>
      <FeaturedProducts dict={dict} />
      <Suspense fallback={<NewArrivalsSkeleton />}>
        <NewArrivals dict={dict} />
      </Suspense>
      <SellerBanner dict={dict} />
      <SecureShipping />
    </>
  );
}
