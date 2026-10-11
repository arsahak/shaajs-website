import { getDictionary } from "@/app/dictionaries";
import { requireCustomerProfile } from "@/app/utils/require-customer";
import { PageHero } from "@/component/common/PageHero";
import { AccountShell } from "@/component/customr_account/AccountShell";
import { ProfileDetails } from "@/component/customr_account/ProfileDetails";
import { UserRound } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.account.profile_title, robots: { index: false } };
}

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
