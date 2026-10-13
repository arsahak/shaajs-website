"use server";

import { auth, signIn, signOut } from "@/auth";
import { safeCallbackUrl } from "@/app/utils/safe-redirect";

const API = `${process.env.NEXT_PUBLIC_API_URL || "https://fishmeaqua-backend.vercel.app"}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActionResult = { success: boolean; message: string };
export type SigninResult = { ok: boolean; error?: string; redirectTo?: string };
export type SignupResult =
  | { ok: false; error: string }
  | { ok: true; otpRequired: true; identifier: string; channel: "email" | "phone" };
export type OtpActionResult = { ok: boolean; error?: string; message?: string };

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

// ── Customer auth (website sign-in / sign-up) ───────────────────────────────────
// Sign-in goes through the "customer-credentials" provider registered in
// auth.ts, which calls the backend's /api/v1/auth/signin (rejects staff
// accounts). Sign-up calls the backend's /api/v1/auth/signup directly, then
// signs the new account in the same way.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Codes set by CustomerSigninError in auth.ts, from the backend's response.
const SIGNIN_ERROR_MESSAGES: Record<string, string> = {
  account_not_found:
    "No account found with this email or phone number. Please sign up first.",
  wrong_password: "Incorrect password. Please try again.",
  account_inactive: "Your account is inactive. Please contact support.",
};

function isCredentialsError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { message, type } = error as { message?: string; type?: string };
  return (
    type === "CredentialsSignin" ||
    Boolean(message?.includes("CredentialsSignin")) ||
    Boolean(message?.includes("credentials"))
  );
}

export async function customerSigninAction(
  prevState: SigninResult,
  formData: FormData,
): Promise<SigninResult> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"), "/");

  if (!identifier || !password) {
    return { ok: false, error: "Email/phone and password are required." };
  }

  try {
    await signIn("customer-credentials", {
      identifier,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo: callbackUrl };
  } catch (error) {
    if (isCredentialsError(error)) {
      const code = (error as { code?: string }).code ?? "";
      return {
        ok: false,
        error: SIGNIN_ERROR_MESSAGES[code] ?? "Invalid email/phone or password.",
      };
    }
    return { ok: false, error: "An error occurred. Please try again." };
  }
}

// Step 1: starts signup and triggers an OTP email/SMS. Doesn't create the
// account yet — see verifySignupOtpAction, which completes it.
export async function customerSignupAction(
  prevState: SignupResult,
  formData: FormData,
): Promise<SignupResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || !identifier || !password) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const isEmail = EMAIL_RE.test(identifier);

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: isEmail ? identifier : undefined,
        phone: isEmail ? undefined : identifier,
        password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        body?.errors?.[0] || body?.message || "Could not create your account.";
      return { ok: false, error: message };
    }

    return {
      ok: true,
      otpRequired: true,
      identifier,
      channel: body?.data?.channel === "phone" ? "phone" : "email",
    };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// Step 2: verifies the OTP, which creates the account on the backend, then
// signs the new account in the normal way (same as customerSigninAction).
export async function verifySignupOtpAction(
  prevState: SigninResult,
  formData: FormData,
): Promise<SigninResult> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const otp = (formData.get("otp") as string)?.trim();
  const password = formData.get("password") as string;
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"), "/");

  if (!identifier || !otp || !password) {
    return { ok: false, error: "Please enter the code we sent you." };
  }

  try {
    const res = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.errors?.[0] || body?.message || "Invalid code.";
      return { ok: false, error: message };
    }
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }

  try {
    await signIn("customer-credentials", {
      identifier,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo: callbackUrl };
  } catch {
    // Account was created but the auto sign-in failed; send them to sign in manually.
    return { ok: true, redirectTo: "/sign-in" };
  }
}

// Resends the signup OTP. Called directly from a button click rather than
// through useActionState, since it isn't tied to a form submission.
export async function resendSignupOtpAction(
  identifier: string,
): Promise<OtpActionResult> {
  try {
    const res = await fetch(`${API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: body?.message || "Could not resend the code." };
    }
    return { ok: true, message: body?.message || "Code resent." };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Forgot password ───────────────────────────────────────────────────────────
// Three steps, mirroring the backend: request an OTP for the account, confirm
// it (which returns a one-time reset token), then set the new password with
// that token. See ForgotPasswordForm.

export type PasswordResetRequestResult =
  | { ok: true; identifier: string; channel: "email" | "phone" }
  | { ok: false; error: string };

export type PasswordResetVerifyResult =
  | { ok: true; resetToken: string }
  | { ok: false; error: string };

async function postAuth(
  path: string,
  payload: Record<string, string>,
  fallbackError: string,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      // Sending the OTP (email/SMS) happens inside this request.
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        error: body?.errors?.[0] || body?.message || fallbackError,
      };
    }
    return { ok: true, data: (body?.data ?? {}) as Record<string, unknown> };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// Step 1 — also used to resend the code (the backend allows one per minute).
export async function requestPasswordResetAction(
  rawIdentifier: string,
): Promise<PasswordResetRequestResult> {
  const identifier = rawIdentifier.trim();
  if (!identifier) {
    return { ok: false, error: "Please enter your email or phone number." };
  }

  const result = await postAuth(
    "forgot-password",
    { identifier },
    "Could not send the code. Please try again.",
  );
  if (!result.ok) return result;

  return {
    ok: true,
    // The backend's normalized form — later steps must use the same value.
    identifier:
      typeof result.data.identifier === "string"
        ? result.data.identifier
        : identifier,
    channel: result.data.channel === "phone" ? "phone" : "email",
  };
}

// Step 2.
export async function verifyPasswordResetOtpAction(
  identifier: string,
  otp: string,
): Promise<PasswordResetVerifyResult> {
  if (!identifier || !otp.trim()) {
    return { ok: false, error: "Please enter the code we sent you." };
  }

  const result = await postAuth(
    "forgot-password/verify-otp",
    { identifier, otp: otp.trim() },
    "Invalid code.",
  );
  if (!result.ok) return result;

  const resetToken = result.data.resetToken;
  if (typeof resetToken !== "string" || !resetToken) {
    return { ok: false, error: "Could not verify the code. Please try again." };
  }
  return { ok: true, resetToken };
}

// Step 3 — sets the new password, then signs the customer in with it.
export async function resetPasswordAction(input: {
  identifier: string;
  resetToken: string;
  newPassword: string;
  callbackUrl?: string;
}): Promise<SigninResult> {
  const { identifier, resetToken, newPassword } = input;
  const callbackUrl = safeCallbackUrl(input.callbackUrl, "/");

  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const result = await postAuth(
    "reset-password",
    { identifier, resetToken, newPassword },
    "Could not update your password. Please try again.",
  );
  if (!result.ok) return result;

  try {
    await signIn("customer-credentials", {
      identifier,
      password: newPassword,
      redirect: false,
    });
    return { ok: true, redirectTo: callbackUrl };
  } catch {
    // The password did change; only the automatic sign-in failed.
    return { ok: true, redirectTo: "/sign-in" };
  }
}

// ── Sign in with a code ───────────────────────────────────────────────────────
// The sign-in the storefront uses: no password. Two steps, mirroring the
// backend: ask for a code by email or phone, then sign in with it. An email or
// phone with no account yet gets one on the second step. See OtpSignIn.

export type SigninOtpRequestResult =
  | { ok: true; identifier: string; channel: "email" | "phone" }
  | { ok: false; error: string };

// Codes set by CustomerSigninError in auth.ts, from the backend's response.
const SIGNIN_OTP_ERROR_MESSAGES: Record<string, string> = {
  otp_incorrect: "Incorrect code. Please try again.",
  otp_expired: "This code has expired. Please request a new one.",
  otp_too_many_attempts:
    "Too many incorrect attempts. Please request a new code.",
  otp_not_requested: "Please request a new code.",
  account_inactive: "Your account is inactive. Please contact support.",
  not_a_customer: "This email or phone number can't be used to sign in here.",
};

// Step 1 — also used to resend the code (the backend allows one per minute).
export async function requestSigninOtpAction(
  rawIdentifier: string,
): Promise<SigninOtpRequestResult> {
  const identifier = rawIdentifier.trim();
  if (!identifier) {
    return { ok: false, error: "Please enter your email or phone number." };
  }

  const result = await postAuth(
    "signin/request-otp",
    { identifier },
    "Could not send the code. Please try again.",
  );
  if (!result.ok) return result;

  return {
    ok: true,
    // The backend's normalized form — step 2 must use the same value.
    identifier:
      typeof result.data.identifier === "string"
        ? result.data.identifier
        : identifier,
    channel: result.data.channel === "phone" ? "phone" : "email",
  };
}

// Step 2 — goes through the "customer-otp" provider registered in auth.ts,
// which checks the code with the backend and starts the session.
export async function verifySigninOtpAction(input: {
  identifier: string;
  otp: string;
  callbackUrl?: string;
}): Promise<SigninResult> {
  const identifier = input.identifier.trim();
  const otp = input.otp.trim();
  const callbackUrl = safeCallbackUrl(input.callbackUrl, "/");

  if (!identifier || !otp) {
    return { ok: false, error: "Please enter the code we sent you." };
  }

  try {
    await signIn("customer-otp", { identifier, otp, redirect: false });
    return { ok: true, redirectTo: callbackUrl };
  } catch (error) {
    if (isCredentialsError(error)) {
      const code = (error as { code?: string }).code ?? "";
      return {
        ok: false,
        error:
          SIGNIN_OTP_ERROR_MESSAGES[code] ??
          "Could not verify the code. Please try again.",
      };
    }
    return { ok: false, error: "An error occurred. Please try again." };
  }
}

// ── Staff auth (manager, admin, superadmin) ────────────────────────────────────
// Goes through the "admin-credentials" provider registered in auth.ts, which
// calls the backend's /api/v1/auth/staff/signin (rejects customer accounts).

export async function adminSigninAction(
  prevState: SigninResult,
  formData: FormData,
): Promise<SigninResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  try {
    await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true, redirectTo: callbackUrl };
  } catch (error: any) {
    const msg: string = error?.message || "";
    if (
      msg.includes("CredentialsSignin") ||
      msg.includes("credentials") ||
      error?.type === "CredentialsSignin"
    ) {
      return { ok: false, error: "Invalid email or password." };
    }
    return { ok: false, error: "An error occurred. Please try again." };
  }
}

// ── Own admin profile (any signed-in staff member) ──────────────────────────────
// Full staff CRUD (list/create/update/delete other accounts) lives in
// app/actions/staff.ts, backed by the real /api/v1/users/staff endpoints.

export type AdminRole = "customer" | "manager" | "admin" | "superadmin";

export interface AdminAccount {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

interface AdminDataResponse<T = unknown> {
  ok: boolean;
  data?: T | null;
  error?: string;
}

async function getAdminAuthToken() {
  const session = await auth();
  return (session?.user as any)?.accessToken as string | undefined;
}

async function parseAdminError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
  } catch {
    // ignore parse failure
  }
  return fallback;
}

export async function getMyAdminProfileAction(): Promise<
  AdminDataResponse<AdminAccount>
> {
  const token = await getAdminAuthToken();
  if (!token) return { ok: false, error: "Not authenticated." };

  try {
    const res = await fetch(`${API}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        error: await parseAdminError(res, "Failed to fetch profile."),
      };
    }
    const body = await res.json();
    return { ok: true, data: body.data as AdminAccount };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
