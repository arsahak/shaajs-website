import { getDictionary } from "@/app/dictionaries";
import { BestForGrid } from "@/component/home/BestForGrid";
import { FeaturedProducts } from "@/component/home/FeaturedProducts";
import { HeroSection } from "@/component/home/HeroSection";
import { NewArrivals } from "@/component/home/NewArrivals";
import SecureShipping from "@/component/home/SecureShipping";
import { SellerBanner } from "@/component/home/SellerBanner";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <>
      <HeroSection dict={dict} />
      <BestForGrid />
      <FeaturedProducts dict={dict} />
      <NewArrivals dict={dict} />
      <SellerBanner dict={dict} />
      <SecureShipping />
    </>
  );
}
