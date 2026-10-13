import { getDictionary } from "@/app/dictionaries";
import { requireCustomerProfile } from "@/app/utils/require-customer";
import { PageHero } from "@/component/common/PageHero";
import { AccountShell } from "@/component/customr_account/AccountShell";
import { ProfileDetails } from "@/component/customr_account/ProfileDetails";
import { UserRound } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/account");

export default async function AccountPage() {
  const dict = await getDictionary();
  const profile = await requireCustomerProfile("/account");

  return (
    <>
      <PageHero
        title={dict.account.profile_title}
        homeLabel={dict.nav.home}
        icon={UserRound}
      />
      <AccountShell dict={dict} className="container py-6">
        <ProfileDetails dict={dict} profile={profile} />
      </AccountShell>
    </>
  );
}
