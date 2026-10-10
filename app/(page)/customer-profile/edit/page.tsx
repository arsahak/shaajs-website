import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/auth";
import { getMyProfile } from "@/app/actions/user";
import { EditProfileForm } from "@/component/customr_account/EditProfileForm";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const dict = await getDictionary();

  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const profile = await getMyProfile();
  if (!profile.ok) redirect("/sign-in");

  return (
    <div className="container max-w-[560px] py-10 sm:py-14">
      <h1 className="mb-8 text-2xl font-bold text-(--color-dark)">
        {dict.nav.profile}
      </h1>
      <EditProfileForm dict={dict} profile={profile.data} />
    </div>
  );
}
