"use client";

import {
  requestPasswordResetAction,
  resetPasswordAction,
  verifyPasswordResetOtpAction,
} from "@/app/actions/auth";
import type { Dictionary } from "@/app/dictionaries";
import {
  fieldClass,
  supplementalCopy,
  type AuthView,
} from "@/component/auth/AuthForm";
import { usePinnedPosition } from "@/component/auth/usePinnedPosition";
import { queueToast } from "@/component/providers/ToastProvider";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

interface ForgotPasswordFormProps {
  dict: Dictionary;
  /** Email/phone already typed on the sign-in form, if any. */
  initialIdentifier?: string;
  callbackUrl?: string;
  /** Inside the sign-in modal: goes back to sign-in in place. */
  onSwitchView?: (view: AuthView) => void;
}

type Step = "identifier" | "otp" | "password";

const STEPS: Step[] = ["identifier", "otp", "password"];
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;

// Text specific to this flow; the OTP-step wording is shared with sign-up
// (see supplementalCopy in AuthForm).
const resetCopy = {
  subtitle:
    "Enter your email or phone number and we'll send you a code to reset your password.",
  sendCode: "Send code",
  codeTitle: "Enter the code",
  newPasswordTitle: "Set a new password",
  newPasswordSubtitle: "Choose a new password for your account.",
  newPassword: "New password",
  confirmNewPassword: "Confirm new password",
  updatePassword: "Update password",
  success: "Password updated. You're signed in.",
  successSignIn: "Password updated. Please sign in with your new password.",
  startAgain: "Start again",
};

const submitClass =
  "group h-12 w-full rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70";
// Text-style buttons: p-0 cancels the global button padding, which otherwise
// makes the two links on the code step too wide for a phone screen.
const linkButtonClass =
  "p-0 font-semibold text-(--color-primary) hover:text-(--color-primary-dark) disabled:cursor-not-allowed disabled:text-(--color-text-light)";

/**
 * Forgot password, in three steps on one page: ask for the account's email
 * or phone → confirm the code sent to it → choose a new password (which also
 * signs the customer in).
 */
export function ForgotPasswordForm({
  dict,
  initialIdentifier = "",
  callbackUrl: callbackUrlProp,
  onSwitchView,
}: ForgotPasswordFormProps) {
  const copy = resetCopy;
  const otpCopy = supplementalCopy;
  const callbackUrl = callbackUrlProp ?? "/";

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  // What the backend knows the account as (normalized) — used from step 2 on.
  const [account, setAccount] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  // The reset ran out (or was already used) — the only way on is from step 1.
  const [mustRestart, setMustRestart] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  usePinnedPosition(rootRef);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const goToStep = (next: Step) => {
    setError("");
    setNotice("");
    setStep(next);
  };

  const restart = () => {
    setOtp("");
    setResetToken("");
    setPassword("");
    setConfirmPassword("");
    setMustRestart(false);
    goToStep("identifier");
  };

  // Step 1 (and "resend" on step 2): send a code to the account.
  const sendCode = async (isResend: boolean) => {
    setPending(true);
    setError("");
    setNotice("");
    const result = await requestPasswordResetAction(
      isResend ? account : identifier,
    );
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAccount(result.identifier);
    setChannel(result.channel);
    setOtp("");
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    if (isResend) setNotice("Code resent.");
    else goToStep("otp");
  };

  const handleIdentifierSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendCode(false);
  };

  // Step 2: confirm the code.
  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const result = await verifyPasswordResetOtpAction(account, otp);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResetToken(result.resetToken);
    goToStep("password");
  };

  // Step 3: set the new password.
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordLongEnough) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      // The field already says so underneath — just take the customer to it.
      confirmRef.current?.focus();
      return;
    }

    setPending(true);
    setError("");
    const result = await resetPasswordAction({
      identifier: account,
      resetToken,
      newPassword: password,
      callbackUrl,
    });

    if (!result.ok) {
      setPending(false);
      setError(result.error ?? "Could not update your password.");
      // An expired/used reset can't be retried from here.
      setMustRestart(/expired|not valid|start again/i.test(result.error ?? ""));
      return;
    }

    // Queued, since the full page navigation would discard a toast shown now.
    // (Landing on sign-in means the automatic sign-in didn't go through.)
    const signedIn = !result.redirectTo?.includes("/sign-in");
    queueToast("success", signedIn ? copy.success : copy.successSignIn);
    window.location.href = result.redirectTo || callbackUrl;
  };

  const stepNumber = STEPS.indexOf(step) + 1;

  return (
    <div ref={rootRef} className="w-full max-w-[480px] min-w-0">
      <div className="mb-6 sm:mb-8">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-semibold text-(--color-primary) shadow-(--shadow-sm)">
          <span className="size-1.5 rounded-full bg-(--color-secondary) shadow-[0_0_0_4px_var(--color-secondary-faint)]" />
          {stepNumber} / {STEPS.length}
        </span>
        <h1 className="text-center text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.045em] text-(--color-dark)">
          {step === "identifier"
            ? dict.auth.forgot_password_title
            : step === "otp"
              ? copy.codeTitle
              : copy.newPasswordTitle}
        </h1>
        <p className="mt-3 text-center text-base leading-7 text-(--color-text-muted)">
          {step === "identifier" ? (
            copy.subtitle
          ) : step === "otp" ? (
            <>
              {otpCopy.otpSubtitle}{" "}
              <span className="font-semibold break-all text-(--color-dark)">
                {account}
              </span>{" "}
              {channel === "email" ? (
                <Mail aria-hidden="true" size={14} className="inline align-[-2px]" />
              ) : (
                <MessageSquare
                  aria-hidden="true"
                  size={14}
                  className="inline align-[-2px]"
                />
              )}
            </>
          ) : (
            copy.newPasswordSubtitle
          )}
        </p>
      </div>

      {/* Each step is its own keyed form, so React never recycles one step's
          inputs (and their text) for the next. */}
      {step === "identifier" && (
        <form
          key="identifier"
          onSubmit={handleIdentifierSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label htmlFor="reset-identifier">{dict.auth.email_or_phone}</label>
            <div className="relative">
              <AtSign
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                id="reset-identifier"
                name="identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                placeholder="name@example.com / +880 1XXX-XXXXXX"
                required
                autoFocus={!initialIdentifier}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError("");
                }}
                className={`${fieldClass} ps-11 pe-4`}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className={submitClass}>
            {pending ? (
              "Sending…"
            ) : (
              <>
                {copy.sendCode}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form key="otp" onSubmit={handleOtpSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="reset-otp">OTP</label>
            <div className="relative">
              <ShieldCheck
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                id="reset-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                required
                autoFocus
                enterKeyHint="done"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className={`${fieldClass} ps-11 pe-4 tracking-[0.3em]`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <button type="button" onClick={restart} className={linkButtonClass}>
              {otpCopy.otpChangeDetails}
            </button>
            <button
              type="button"
              onClick={() => void sendCode(true)}
              disabled={pending || resendCooldown > 0}
              className={linkButtonClass}
            >
              {resendCooldown > 0
                ? `${otpCopy.otpResend} (${resendCooldown}s)`
                : otpCopy.otpResend}
            </button>
          </div>

          {notice && (
            <p className="text-sm font-medium text-(--color-success)">{notice}</p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className={submitClass}>
            {pending ? (
              "Verifying…"
            ) : (
              <>
                {otpCopy.otpVerify}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      )}

      {step === "password" && (
        <form
          key="password"
          onSubmit={handlePasswordSubmit}
          className="mt-8 space-y-5"
        >
          {/* Lets password managers file the new password under the account. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={account}
            readOnly
            hidden
          />

          <div>
            <label htmlFor="reset-password">{copy.newPassword}</label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                id="reset-password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                required
                autoFocus
                enterKeyHint="next"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={`${fieldClass} ps-11 pe-12`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute end-1 top-1/2 size-10 -translate-y-1/2 rounded-lg !p-0 text-(--color-text-light) hover:bg-(--color-bg) hover:text-(--color-dark)"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p
              className={`mt-2 flex items-center gap-1.5 text-sm transition-colors ${
                passwordLongEnough
                  ? "text-(--color-success)"
                  : "text-(--color-text-muted)"
              }`}
            >
              <Check
                aria-hidden="true"
                className={`h-[15px] w-[15px] shrink-0 transition-opacity ${
                  passwordLongEnough ? "opacity-100" : "opacity-30"
                }`}
              />
              {otpCopy.passwordHint}
            </p>
          </div>

          <div>
            <label htmlFor="reset-confirm-password">
              {copy.confirmNewPassword}
            </label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                ref={confirmRef}
                id="reset-confirm-password"
                name="confirmPassword"
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                required
                enterKeyHint="go"
                aria-invalid={passwordsMismatch}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className={`${fieldClass} ps-11 pe-12 ${
                  passwordsMismatch ? "border-(--color-error)" : ""
                }`}
              />
              <button
                type="button"
                aria-label={showConfirmation ? "Hide password" : "Show password"}
                aria-pressed={showConfirmation}
                onClick={() => setShowConfirmation((visible) => !visible)}
                className="absolute end-1 top-1/2 size-10 -translate-y-1/2 rounded-lg !p-0 text-(--color-text-light) hover:bg-(--color-bg) hover:text-(--color-dark)"
              >
                {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-2 text-sm text-(--color-error)">
                Passwords do not match.
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)"
            >
              {error}
            </p>
          )}

          {mustRestart ? (
            <button type="button" onClick={restart} className={submitClass}>
              {copy.startAgain}
            </button>
          ) : (
            <button type="submit" disabled={pending} className={submitClass}>
              {pending ? (
                "Saving…"
              ) : (
                <>
                  {copy.updatePassword}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          )}
        </form>
      )}

      <p className="mt-7 text-center text-sm">
        {onSwitchView ? (
          <button
            type="button"
            onClick={() => onSwitchView("sign-in")}
            className="inline-flex items-center gap-1.5 p-0 text-sm font-bold text-(--color-primary) hover:text-(--color-primary-dark)"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            {dict.auth.back_to_sign_in}
          </button>
        ) : (
        <Link
          href={`/sign-in${
            callbackUrlProp
              ? `?callbackUrl=${encodeURIComponent(callbackUrlProp)}`
              : ""
          }`}
          className="inline-flex items-center gap-1.5 font-bold text-(--color-primary) hover:text-(--color-primary-dark)"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          {dict.auth.back_to_sign_in}
        </Link>
        )}
      </p>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-(--color-text-light)">
        <LockKeyhole size={13} />
        {otpCopy.secureNote}
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
