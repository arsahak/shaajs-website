import { redirect } from "next/navigation";

// The profile editor moved to /account/edit; old links still work.
export default function LegacyEditProfilePage() {
  redirect("/account/edit");
}
