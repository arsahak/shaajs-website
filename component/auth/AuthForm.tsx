"use client";

import { OTP_LENGTH } from "@/component/auth/OtpInput";
import {
  customerSigninAction,
  customerSignupAction,
  resendSignupOtpAction,
  verifySignupOtpAction,
} from "@/app/actions/auth";
import type { Dictionary } from "@/app/dictionaries";
import { fieldClass, submitClass } from "@/component/auth/authStyles";
import {
  OtpSignIn,
  otpSignInCopy,
  type OtpSignInStep,
} from "@/component/auth/OtpSignIn";
import { usePinnedPosition } from "@/component/auth/usePinnedPosition";
import { queueToast } from "@/component/providers/ToastProvider";
import {
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type AuthMode = "sign-in" | "sign-up";

/** The three account screens the sign-in modal moves between. */
export type AuthView = AuthMode | "forgot-password";

interface AuthFormProps {
  mode: AuthMode;
  dict: Dictionary;
  callbackUrl?: string;
  /**
   * Inside the sign-in modal: switches to another screen in place. Without it
   * the form's links navigate instead.
   */
  onSwitchView?: (view: AuthView, options?: { identifier?: string }) => void;
}

export const supplementalCopy = {
  emailSignIn: "Sign in with Email",
  emailSignUp: "Sign up with Email",
  phoneSignIn: "Sign in with Phone",
  phoneSignUp: "Sign up with Phone",
  phone: "Phone",
  signIn: "Sign in",
  signUp: "Create account",
  termsLead: "By creating an account, you agree to our",
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  passwordHint: "Use 8 or more characters",
  secureNote: "Your information is protected with secure encryption.",
  otpTitle: "Verify your account",
  otpSubtitle: `We sent a ${OTP_LENGTH}-digit code to`,
  otpVerify: "Verify & continue",
  otpResend: "Resend code",
  otpChangeDetails: "Use a different email or phone",
  signupSuccess: "Account created successfully. Welcome to Shaajs!",
  signedIn: "Signed in successfully. Welcome to Shaajs!",
};

const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;
// 16px on phones: iOS Safari zooms the page when a focused field is smaller.
// The modal's in-place screen switches: buttons made to look like the links
// they replace (p-0 cancels the global button padding).
const switchLinkClass =
  "p-0 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)";
const altSignInClass =
  "h-12 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-4 text-sm font-semibold text-(--color-dark) transition-colors hover:border-(--color-dark) hover:bg-(--color-bg)";

export { fieldClass };

export function AuthForm({
  mode,
  dict,
  callbackUrl: callbackUrlProp,
  onSwitchView,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isSignUp = mode === "sign-up";
  const copy = supplementalCopy;

  const callbackUrl = callbackUrlProp ?? "/";
  // The fields are controlled: React resets *uncontrolled* form fields after
  // every action submission — including failed ones — which wiped everything
  // the visitor typed whenever sign-in/sign-up returned an error.
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Caught in the browser before submitting, so there's no server round-trip.
  const [clientError, setClientError] = useState("");
  const [otp, setOtp] = useState("");
  // Phone is the default; the button under the form switches to email.
  const [method, setMethod] = useState<"phone" | "email">("phone");
  // Where the code sign-in (phone/email → code → done) has got to, and where
  // the code went. Kept here because the heading above the form follows it.
  const [codeStep, setCodeStep] = useState<OtpSignInStep>("contact");
  const [codeSentTo, setCodeSentTo] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const [signinState, signinFormAction, signinPending] = useActionState(
    customerSigninAction,
    { ok: false, error: "" },
  );
  const [signupState, signupFormAction, signupPending] = useActionState(
    customerSignupAction,
    { ok: false, error: "" },
  );
  const [verifyState, verifyFormAction, verifyPending] = useActionState(
    verifySignupOtpAction,
    { ok: false, error: "" },
  );

  const [otpStep, setOtpStep] = useState(false);
  const [pendingIdentifier, setPendingIdentifier] = useState("");
  const [pendingChannel, setPendingChannel] = useState<"email" | "phone">("email");

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  usePinnedPosition(rootRef);

  useEffect(() => {
    if (signinState.ok) {
      // Full page navigation so server components re-render with the fresh
      // session cookie instead of serving a stale RSC cache — so the toast
      // is queued for the page that loads, not shown on this one.
      queueToast("success", copy.signedIn);
      window.location.href = signinState.redirectTo || callbackUrl;
    }
  }, [signinState, callbackUrl, copy.signedIn]);

  useEffect(() => {
    if (signupState.ok && signupState.otpRequired) {
      setPendingIdentifier(signupState.identifier);
      setPendingChannel(signupState.channel);
      setOtpStep(true);
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    }
  }, [signupState]);

  useEffect(() => {
    if (verifyState.ok) {
      // The account now exists and is signed in. Queued rather than shown
      // directly, since the full page navigation below would discard it.
      queueToast("success", copy.signupSuccess);
      window.location.href = verifyState.redirectTo || callbackUrl;
    }
  }, [verifyState, callbackUrl, copy.signupSuccess]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleResend() {
    setResendPending(true);
    setResendError("");
    setResendMessage("");
    const result = await resendSignupOtpAction(pendingIdentifier);
    setResendPending(false);
    if (result.ok) {
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setResendMessage(result.message ?? "Code resent.");
    } else {
      setResendError(result.error ?? "Could not resend the code.");
    }
  }

  const showOtpStep = isSignUp && otpStep;
  // Signing in asks for a phone number or an email and a one-time code — no
  // password. That flow is its own component (OtpSignIn), so the details form
  // below is only shown for sign-up; its sign-in parts (password, "Forgot
  // password?", "Remember me") are not reached at present.
  const codeSignIn = !isSignUp;
  const codeCopy = otpSignInCopy;
  const signupError = !signupState.ok ? signupState.error : undefined;
  const serverError = isSignUp ? signupError : signinState.error;
  const detailsError = clientError || serverError;
  const detailsPending = isSignUp ? signupPending : signinPending;

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  // Leave the page where it is. Only if the message would be off-screen
  // (under the phone keyboard, or below the fold) nudge it into view by the
  // smallest amount. Keyed on the state objects so a repeat of the same error
  // is checked again.
  useEffect(() => {
    const message = errorRef.current;
    if (!detailsError || !message) return;
    const { top, bottom } = message.getBoundingClientRect();
    // visualViewport excludes the on-screen keyboard; innerHeight doesn't.
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    if (top < 0 || bottom > viewportHeight) {
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [detailsError, signupState, signinState]);

  // Same checks customerSignupAction makes, run first in the browser.
  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    let error = "";
    if (isSignUp) {
      if (!passwordLongEnough) {
        error = "Password must be at least 8 characters.";
      } else if (password !== confirmPassword) {
        // The confirm field already says so underneath — no second message.
        event.preventDefault();
        confirmRef.current?.focus();
      }
    }
    setClientError(error);
    if (error) event.preventDefault();
  }

  return (
    <div ref={rootRef} className="w-full max-w-[480px] min-w-0">
      <div className="mb-6 sm:mb-8">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-semibold text-(--color-primary) shadow-(--shadow-sm)">
          <span className="size-1.5 rounded-full bg-(--color-secondary) shadow-[0_0_0_4px_var(--color-secondary-faint)]" />
          {isSignUp ? dict.nav.sign_up : dict.nav.sign_in}
        </span>
        <h1 className="text-center text-[clamp(1.75rem,3.2vw,2.25rem)] font-extrabold tracking-[-0.04em] text-(--color-dark)">
          {showOtpStep
            ? copy.otpTitle
            : isSignUp
              ? dict.auth.sign_up_title
              : codeSignIn && codeStep === "otp"
                ? codeCopy.otpTitle
                : dict.auth.sign_in_title}
        </h1>
        <p className="mt-2.5 text-center text-[0.9375rem] leading-6 text-(--color-text-muted)">
          {showOtpStep ? (
            <>
              {copy.otpSubtitle}{" "}
              <span className="font-semibold break-all text-(--color-dark)">
                {pendingIdentifier}
              </span>{" "}
              {pendingChannel === "email" ? (
                <Mail aria-hidden="true" size={14} className="inline align-[-2px]" />
              ) : (
                <MessageSquare aria-hidden="true" size={14} className="inline align-[-2px]" />
              )}
            </>
          ) : isSignUp ? (
            dict.auth.sign_up_subtitle
          ) : codeSignIn && codeStep === "otp" ? (
            <>
              {codeCopy.otpSubtitle}{" "}
              <span className="font-semibold break-all text-(--color-dark)">
                {codeSentTo}
              </span>
            </>
          ) : (
            dict.auth.sign_in_subtitle
          )}
        </p>
      </div>

      {showOtpStep ? (
        // Distinct keys: without them React reuses the details form's DOM for
        // this one (same element type, same position), and the password
        // <input> gets recycled as the OTP <input> — text and all.
        <form key="otp" action={verifyFormAction} className="space-y-5 mt-8">
          <input type="hidden" name="identifier" value={pendingIdentifier} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div>
            <label htmlFor="otp">OTP</label>
            <div className="relative">
              <ShieldCheck
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder={"1234567890".slice(0, OTP_LENGTH)}
                required
                autoFocus
                enterKeyHint="done"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`${fieldClass} ps-11 pe-4 tracking-[0.3em]`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setResendMessage("");
                setResendError("");
              }}
              className="p-0 font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
            >
              {copy.otpChangeDetails}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendPending || resendCooldown > 0}
              className="p-0 font-semibold text-(--color-primary) hover:text-(--color-primary-dark) disabled:cursor-not-allowed disabled:text-(--color-text-light)"
            >
              {copy.otpResend}
            </button>
          </div>

          {resendMessage && (
            <p className="text-sm font-medium text-(--color-success)">{resendMessage}</p>
          )}
          {resendError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)">
              {resendError}
            </p>
          )}
          {verifyState.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)">
              {verifyState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={verifyPending}
            className={submitClass}
          >
            {verifyPending ? (
              "Verifying…"
            ) : (
              <>
                {copy.otpVerify}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      ) : codeSignIn ? (
        <div className="mt-8">
          <OtpSignIn
            // A fresh form for each: nothing typed carries from one to the other.
            key={method}
            channel={method}
            step={codeStep}
            onStepChange={(step, sentTo) => {
              setCodeStep(step);
              if (sentTo) setCodeSentTo(sentTo);
            }}
            callbackUrl={callbackUrl}
          />
        </div>
      ) : (
      <form
        key="details"
        action={isSignUp ? signupFormAction : signinFormAction}
        onSubmit={handleDetailsSubmit}
        className="space-y-5 mt-8"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {isSignUp && (
          <div>
            <label htmlFor="full-name">{dict.auth.full_name}</label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={dict.auth.full_name}
                className={`${fieldClass} ps-11 pe-4`}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="identifier">
            {method === "phone" ? copy.phone : dict.auth.email_or_phone}
          </label>
          <div className="relative">
            {method === "phone" ? (
              <Phone
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
            ) : (
              <AtSign
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
            )}
            {/* Still sent as `identifier` either way, which is what the
                backend expects. Phone: the number pad on phones. Email: the @
                keyboard, with no auto-capitals or autocorrect. */}
            <input
              // Remounts on a method switch, so the keyboard type follows it.
              key={method}
              id="identifier"
              name="identifier"
              type={method === "phone" ? "tel" : "text"}
              inputMode={method === "phone" ? "tel" : "email"}
              autoComplete={method === "phone" ? "tel" : "username"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder={
                method === "phone"
                  ? "01XXX-XXXXXX"
                  : "name@example.com / +880 1XXX-XXXXXX"
              }
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`${fieldClass} ps-11 pe-4`}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <label htmlFor="password" className="mb-0">
              {dict.auth.password}
            </label>
            {!isSignUp &&
              (onSwitchView ? (
                <button
                  type="button"
                  // Carries over what's already typed, so it needn't be retyped.
                  onClick={() =>
                    onSwitchView("forgot-password", {
                      identifier: identifier.trim(),
                    })
                  }
                  className={switchLinkClass}
                >
                  {dict.auth.forgot_password}
                </button>
              ) : (
              <Link
                // Carries over what's already typed, so it needn't be retyped.
                href={`/forgot-password${
                  identifier.trim()
                    ? `?identifier=${encodeURIComponent(identifier.trim())}`
                    : ""
                }`}
                className="text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
              >
                {dict.auth.forgot_password}
              </Link>
              ))}
          </div>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="••••••••"
              required
              enterKeyHint={isSignUp ? "next" : "go"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClientError("");
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
          {isSignUp && (
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
              {copy.passwordHint}
            </p>
          )}
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="confirm-password">{dict.auth.confirm_password}</label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
              />
              <input
                ref={confirmRef}
                id="confirm-password"
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
                  setClientError("");
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
        )}

        {!isSignUp && (
          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-(--color-text-muted)">
            <input type="checkbox" name="remember" />
            {dict.auth.remember_me}
          </label>
        )}

        {isSignUp && (
          <p className="text-sm leading-6 text-(--color-text-muted)">
            {copy.termsLead}{" "}
            <Link href="#" className="font-semibold text-(--color-primary)">
              {copy.terms}
            </Link>{" "}
            {dict.common.and}{" "}
            <Link href="#" className="font-semibold text-(--color-primary)">
              {copy.privacy}
            </Link>
            .
          </p>
        )}

        {detailsError && (
          <p
            ref={errorRef}
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)"
          >
            {detailsError}
          </p>
        )}

        <button
          type="submit"
          disabled={detailsPending}
          className={submitClass}
        >
          {detailsPending ? (
            isSignUp ? (
              "Creating account…"
            ) : (
              "Signing in…"
            )
          ) : (
            <>
              {isSignUp ? copy.signUp : copy.signIn}
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>
      )}

      {/* The other way in: one button that switches between phone and email. */}
      {!showOtpStep && !(codeSignIn && codeStep !== "contact") && (
        <div className="mt-7">
          <div className="flex items-center gap-3 text-xs font-medium text-(--color-text-light) uppercase">
            <span className="h-px flex-1 bg-(--color-border)" />
            {dict.common.or}
            <span className="h-px flex-1 bg-(--color-border)" />
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setMethod(method === "phone" ? "email" : "phone");
                setCodeStep("contact");
                setIdentifier("");
                setClientError("");
              }}
              className={altSignInClass}
            >
              {method === "phone" ? (
                <AtSign
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
              ) : (
                <Phone
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
              )}
              {method === "phone"
                ? isSignUp
                  ? copy.emailSignUp
                  : copy.emailSignIn
                : isSignUp
                  ? copy.phoneSignUp
                  : copy.phoneSignIn}
            </button>
          </div>
        </div>
      )}

      {/* Only sign-up links across: the sign-in screen no longer offers
          "Don't have an account? Sign Up". */}
      {isSignUp && !showOtpStep && (
        <p className="mt-7 text-center text-sm text-(--color-text-muted)">
          {isSignUp ? dict.auth.have_account : dict.auth.no_account}{" "}
          {onSwitchView ? (
            <button
              type="button"
              onClick={() => onSwitchView(isSignUp ? "sign-in" : "sign-up")}
              className={`${switchLinkClass} font-bold`}
            >
              {isSignUp ? dict.nav.sign_in : dict.nav.sign_up}
            </button>
          ) : (
          <Link
            href={`/${isSignUp ? "sign-in" : "sign-up"}${
              callbackUrlProp ? `?callbackUrl=${encodeURIComponent(callbackUrlProp)}` : ""
            }`}
            className="font-bold text-(--color-primary) hover:text-(--color-primary-dark)"
          >
            {isSignUp ? dict.nav.sign_in : dict.nav.sign_up}
          </Link>
          )}
        </p>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-(--color-text-light)">
        <LockKeyhole size={13} />
        {copy.secureNote}
      </p>
    </div>
  );
}
