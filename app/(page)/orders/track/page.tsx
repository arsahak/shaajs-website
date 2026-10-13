import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/auth";
import { PageHero } from "@/component/common/PageHero";
import { TrackOrderContent } from "@/component/orders/TrackOrderContent";
import { PackageSearch } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

const DESCRIPTION =
  "Enter your order number to see the latest status of your Shaajs order.";

export const metadata = staticPageMetadata("/orders/track");

export default async function TrackOrderPage({ searchParams }: Props) {
  const dict = await getDictionary();
  const { id } = await searchParams;
  const session = await auth();

  return (
    <>
      <PageHero
        title={dict.topbar.track_order}
        homeLabel={dict.nav.home}
        icon={PackageSearch}
        subtitle={DESCRIPTION}
      />
      <TrackOrderContent
        dict={dict}
        isSignedIn={Boolean(session?.user)}
        initialOrderNumber={typeof id === "string" ? id : undefined}
      />
    </>
  );
}
