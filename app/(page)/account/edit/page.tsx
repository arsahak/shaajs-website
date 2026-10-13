import { getDictionary } from "@/app/dictionaries";
import { requireCustomerProfile } from "@/app/utils/require-customer";
import { PageHero } from "@/component/common/PageHero";
import { AccountShell } from "@/component/customr_account/AccountShell";
import { EditProfileForm } from "@/component/customr_account/EditProfileForm";
import { Pencil } from "lucide-react";
import { staticPageMetadata } from "@/app/data/seo";

export const metadata = staticPageMetadata("/account/edit");

export default async function EditProfilePage() {
  const dict = await getDictionary();
  const profile = await requireCustomerProfile("/account/edit");

  return (
    <>
      <PageHero
        title={dict.account.edit_profile}
        homeLabel={dict.nav.home}
        icon={Pencil}
        parents={[{ label: dict.account.profile_title, href: "/account" }]}
      />
      <AccountShell dict={dict} className="container py-6">
        <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm) sm:max-w-xl">
          <EditProfileForm dict={dict} profile={profile} />
        </div>
      </AccountShell>
    </>
  );
}
