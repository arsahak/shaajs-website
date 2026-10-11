import { getMyProfile, type UserProfile } from "@/app/actions/user";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * For the account pages: the signed-in customer's profile, or a trip to
 * sign-in (and back to `returnTo`) when nobody is signed in or the saved
 * session is no longer accepted.
 */
export async function requireCustomerProfile(
  returnTo: string,
): Promise<UserProfile> {
  const signIn = `/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`;

  const session = await auth();
  if (!session?.user) redirect(signIn);

  const profile = await getMyProfile();
  if (!profile.ok) redirect(signIn);

  return profile.data;
}
