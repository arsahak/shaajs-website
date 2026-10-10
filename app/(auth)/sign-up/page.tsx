import { authModalHref } from "@/app/utils/auth-modal-href";
import { redirect } from "next/navigation";

// There is no standalone page any more — this address opens the modal on the
// homepage, so old links and bookmarks still work.
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  redirect(authModalHref("sign-up", await searchParams));
}
