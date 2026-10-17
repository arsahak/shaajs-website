"use client";

import {
  requestSigninOtpAction,
  verifySigninOtpAction,
} from "@/app/actions/auth";
import { fieldClass, submitClass } from "@/component/auth/authStyles";
import { OTP_LENGTH, OtpInput } from "@/component/auth/OtpInput";
import {
  formatCountdown,
  useOtpCountdown,
} from "@/component/auth/useOtpCountdown";
import { easeSmooth } from "@/component/motion/variants";
import { queueToast } from "@/component/providers/ToastProvider";
import { AnimatePresence, motion } from "framer-motion";
import { formatBdMobile, toBdMobile } from "@/app/utils/bd-mobile";
import { ArrowRight, AtSign, Loader2, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export type OtpSignInStep = "contact" | "otp";
export type OtpSignInChannel = "phone" | "email";

interface OtpSignInProps {
  /** Where the code goes: a phone number or an email address. */
  channel: OtpSignInChannel;
  step: OtpSignInStep;
  /**
   * `sentTo` is the number or address as shown back to the visitor, on the
   * way to "otp".
   */
  onStepChange: (step: OtpSignInStep, sentTo?: string) => void;
  /** Where a successful sign-in lands. */
  callbackUrl: string;
}

/**
 * Under the code boxes: how long the code has left, then — once it has run
 * out — that it has, in the error color.
 */
export function OtpExpiryNote({ expiresIn }: { expiresIn: number }) {
  return expiresIn > 0 ? (
    <p className="mt-2 text-center text-xs text-(--color-text-muted)">
      {otpSignInCopy.otpExpiresIn}{" "}
      <span className="font-semibold text-(--color-dark) tabular-nums">
        {formatCountdown(expiresIn)}
      </span>
    </p>
  ) : (
    <p role="alert" className="mt-2 text-center text-xs text-(--color-error)">
      {otpSignInCopy.otpExpired}
    </p>
  );
}

export const otpSignInCopy = {
  phone: {
    label: "Phone",
    invalid: "Enter a valid Bangladeshi mobile number.",
  },
  email: {
    label: "Email",
    invalid: "Enter a valid email address.",
  },
  signIn: "Sign in",
  otpSending: "Sending code…",
  otpTitle: "Enter the code",
  otpSubtitle: `We sent a ${OTP_LENGTH}-digit code to`,
  otpIncomplete: `Enter all ${OTP_LENGTH} digits of the code.`,
  otpVerify: "Verify & continue",
  otpVerifying: "Verifying…",
  otpResend: "Resend code",
  otpResent: "A new code is on its way.",
  otpExpiresIn: "Code expires in",
  otpExpired: "This code has expired. Resend a new one.",
  otpChange: { phone: "Change number", email: "Change email" },
  signedIn: "Signed in successfully. Welcome to Shaajs!",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const linkButtonClass =
  "p-0 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark) disabled:cursor-not-allowed disabled:text-(--color-text-light)";

/**
 * Sign in with a phone number or an email address and a one-time code — no
 * password. The code goes out by SMS or email; a phone number or email with no
 * account yet gets one when its code is confirmed, so this is sign-up too.
 */
export function OtpSignIn({
  channel,
  step,
  onStepChange,
  callbackUrl,
}: OtpSignInProps) {
  const copy = otpSignInCopy;
  const channelCopy = copy[channel];
  const [contact, setContact] = useState("");
  // The email/phone as the backend normalized it — what the code is tied to.
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  // When the current code was sent: a new one can be asked for a minute
  // later, and it stops working five minutes later.
  const [sentAt, setSentAt] = useState<number | null>(null);
  const { resendIn, expiresIn } = useOtpCountdown(sentAt);

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let sendTo: string;
    let sentTo: string;
    if (channel === "phone") {
      // Accepts 01XXXXXXXXX, 1XXXXXXXXX and +8801XXXXXXXXX alike.
      const mobile = toBdMobile(contact);
      if (!mobile) {
        setError(channelCopy.invalid);
        return;
      }
      sendTo = mobile;
      sentTo = formatBdMobile(mobile);
    } else {
      sendTo = contact.trim();
      sentTo = sendTo;
      if (!EMAIL_RE.test(sendTo)) {
        setError(channelCopy.invalid);
        return;
      }
    }

    setError("");
    setPending(true);
    const result = await requestSigninOtpAction(sendTo);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIdentifier(result.identifier);
    setOtp("");
    setSentAt(Date.now());
    onStepChange("otp", sentTo);
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setError(copy.otpIncomplete);
      return;
    }
    if (expiresIn === 0) {
      setError(copy.otpExpired);
      return;
    }

    setError("");
    setPending(true);
    const result = await verifySigninOtpAction({
      identifier,
      otp,
      callbackUrl,
    });
    if (!result.ok) {
      setPending(false);
      setError(result.error ?? "Could not verify the code. Please try again.");
      return;
    }

    // Stays busy until the page changes. Queued rather than shown directly,
    // since the full page navigation would discard it — and a full navigation
    // so server components re-render with the fresh session cookie.
    queueToast("success", copy.signedIn);
    window.location.href = result.redirectTo || callbackUrl;
  };

  const resend = async () => {
    setOtp("");
    setError("");
    setPending(true);
    const result = await requestSigninOtpAction(identifier);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSentAt(Date.now());
    toast.success(copy.otpResent);
  };

  return (
    // Each step slides in from the right as the last one fades out.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.22, ease: easeSmooth }}
      >
        {step === "contact" && (
          <form onSubmit={sendCode} noValidate className="space-y-5">
            <div>
              <label htmlFor="sign-in-contact">{channelCopy.label}</label>
              {channel === "phone" ? (
                <div
                  className={`flex h-12 items-stretch overflow-hidden rounded-lg border bg-(--color-surface) transition-colors focus-within:border-(--color-dark) ${
                    error ? "border-(--color-error)" : "border-(--color-border)"
                  }`}
                >
                  {/* Laid out like the email field: icon first, then the fixed
                      country code in front of what is typed. */}
                  <span className="flex shrink-0 items-center gap-3 ps-4 text-base font-semibold text-(--color-dark) sm:text-sm">
                    <Phone
                      aria-hidden="true"
                      size={18}
                      className="text-(--color-text-light)"
                    />
                    +880
                  </span>
                  <input
                    id="sign-in-contact"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    autoFocus
                    enterKeyHint="go"
                    placeholder="1XXX-XXXXXX"
                    aria-invalid={Boolean(error)}
                    value={contact}
                    onChange={(event) => {
                      setContact(event.target.value.replace(/[^\d+\s-]/g, ""));
                      setError("");
                    }}
                    // 16px on phones: iOS Safari zooms the page when smaller.
                    className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent ps-2 pe-4 text-base shadow-none outline-none sm:text-sm"
                  />
                </div>
              ) : (
                <div className="relative">
                  <AtSign
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-(--color-text-light)"
                  />
                  <input
                    id="sign-in-contact"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    enterKeyHint="go"
                    placeholder="name@example.com"
                    aria-invalid={Boolean(error)}
                    value={contact}
                    onChange={(event) => {
                      setContact(event.target.value);
                      setError("");
                    }}
                    className={`${fieldClass} ps-11 pe-4 ${
                      error ? "border-(--color-error)" : ""
                    }`}
                  />
                </div>
              )}
              {error && (
                <p role="alert" className="mt-2 text-sm text-(--color-error)">
                  {error}
                </p>
              )}
            </div>

            <button type="submit" disabled={pending} className={submitClass}>
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {copy.otpSending}
                </>
              ) : (
                <>
                  {copy.signIn}
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
          <form onSubmit={verifyCode} noValidate className="space-y-5">
            <div>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                }}
                length={OTP_LENGTH}
                invalid={Boolean(error)}
              />
              {error ? (
                <p role="alert" className="mt-2 text-sm text-(--color-error)">
                  {error}
                </p>
              ) : (
                <OtpExpiryNote expiresIn={expiresIn} />
              )}
            </div>

            <button type="submit" disabled={pending} className={submitClass}>
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {copy.otpVerifying}
                </>
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

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  onStepChange("contact");
                }}
                className={linkButtonClass}
              >
                {copy.otpChange[channel]}
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={pending || resendIn > 0}
                className={linkButtonClass}
              >
                {copy.otpResend}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
