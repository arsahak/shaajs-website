import { getDictionary } from "@/app/dictionaries";
import { requireCustomerProfile } from "@/app/utils/require-customer";
import { PageHero } from "@/component/common/PageHero";
import { AccountShell } from "@/component/customr_account/AccountShell";
import { CustomerSettings } from "@/component/customr_account/CustomerSettings";
import { Settings } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.account.settings_title, robots: { index: false } };
}

export default async function AccountSettingsPage() {
  const dict = await getDictionary();
  const profile = await requireCustomerProfile("/account/settings");

  return (
    <>
      <PageHero
        title={dict.account.settings_title}
        homeLabel={dict.nav.home}
        icon={Settings}
        parents={[{ label: dict.account.profile_title, href: "/account" }]}
      />
      <AccountShell dict={dict} className="container py-6">
        <CustomerSettings dict={dict} profile={profile} />
      </AccountShell>
    </>
  );
}
