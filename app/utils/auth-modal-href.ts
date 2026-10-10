import type { AuthView } from "@/component/auth/AuthForm";

/**
 * The homepage address that opens the sign-in modal on arrival (read by
 * AuthModalProvider) — for server-side redirects, which can't open it directly.
 */
export function authModalHref(
  view: AuthView,
  options: { callbackUrl?: string; identifier?: string } = {},
): string {
  const params = new URLSearchParams({ auth: view });
  if (typeof options.callbackUrl === "string") {
    params.set("callbackUrl", options.callbackUrl);
  }
  if (typeof options.identifier === "string") {
    params.set("identifier", options.identifier);
  }
  return `/?${params.toString()}`;
}
