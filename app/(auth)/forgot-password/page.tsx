import { authModalHref } from "@/app/utils/auth-modal-href";
import { redirect } from "next/navigation";

// There is no standalone page any more — this address opens the modal on the
// homepage, so old links and bookmarks still work.
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ identifier?: string; callbackUrl?: string }>;
}) {
  redirect(authModalHref("forgot-password", await searchParams));
}
