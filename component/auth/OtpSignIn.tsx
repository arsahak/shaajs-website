"use client";

import { fieldClass, submitClass } from "@/component/auth/authStyles";
import { OtpInput } from "@/component/auth/OtpInput";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion } from "framer-motion";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { ArrowRight, AtSign, Check, Loader2, Phone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export type OtpSignInStep = "contact" | "otp" | "done";
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
  /** Closes the modal once the visitor is through. */
  onDone?: () => void;
}

export const otpSignInCopy = {
  phone: {
    label: "Phone",
    invalid: "Enter a valid Bangladeshi mobile number.",
    demoHint: "Demo: no SMS is sent yet — any 6 digits will work.",
    doneTitle: "Number verified",
  },
  email: {
    label: "Email",
    invalid: "Enter a valid email address.",
    demoHint: "Demo: no email is sent yet — any 6 digits will work.",
    doneTitle: "Email verified",
  },
  signIn: "Sign in",
  otpSending: "Sending code…",
  otpTitle: "Enter the code",
  otpSubtitle: "We sent a 6-digit code to",
  otpIncomplete: "Enter all 6 digits of the code.",
  otpVerify: "Verify & continue",
  otpVerifying: "Verifying…",
  otpResend: "Resend code",
  otpResent: "A new code is on its way.",
  otpChange: { phone: "Change number", email: "Change email" },
  doneSubtitle: "Thanks for trying it out.",
  otpDemoDone:
    "This is a demo. Signing in with a code isn't connected to our server yet, so you are not signed in.",
  done: "Done",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
// How long the demo "sends" and "checks" a code, so the buttons show their
// busy state the way they will with a real server.
const DEMO_DELAY_MS = 700;

const linkButtonClass =
  "p-0 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark) disabled:cursor-not-allowed disabled:text-(--color-text-light)";

/**
 * Sign in with a phone number or an email address and a one-time code — no
 * password.
 *
 * DEMO: nothing here talks to the backend yet. No SMS or email is sent, any
 * six digits are accepted, and nobody is actually signed in at the end. When
 * the backend has code sign-in, `sendCode` and `verifyCode` are the two places
 * to call it.
 */
export function OtpSignIn({
  channel,
  step,
  onStepChange,
  onDone,
}: OtpSignInProps) {
  const copy = otpSignInCopy;
  const channelCopy = copy[channel];
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let sentTo: string;
    if (channel === "phone") {
      // Accepts 01XXXXXXXXX, 1XXXXXXXXX and +8801XXXXXXXXX alike.
      const number = parsePhoneNumberFromString(contact, "BD");
      if (!number?.isValid() || number.country !== "BD") {
        setError(channelCopy.invalid);
        return;
      }
      sentTo = number.formatInternational();
    } else {
      sentTo = contact.trim();
      if (!EMAIL_RE.test(sentTo)) {
        setError(channelCopy.invalid);
        return;
      }
    }

    setError("");
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setOtp("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      onStepChange("otp", sentTo);
    }, DEMO_DELAY_MS);
  };

  const verifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setError(copy.otpIncomplete);
      return;
    }

    setError("");
    setPending(true);
    setTimeout(() => {
      setPending(false);
      onStepChange("done");
    }, DEMO_DELAY_MS);
  };

  const resend = () => {
    setOtp("");
    setError("");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
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
              {error && (
                <p role="alert" className="mt-2 text-sm text-(--color-error)">
                  {error}
                </p>
              )}
              <p className="mt-3 text-center text-xs text-(--color-text-light)">
                {channelCopy.demoHint}
              </p>
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
                disabled={resendCooldown > 0}
                className={linkButtonClass}
              >
                {resendCooldown > 0
                  ? `${copy.otpResend} (${resendCooldown}s)`
                  : copy.otpResend}
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
              <Check size={30} strokeWidth={2.5} />
            </span>
            <p className="max-w-[36ch] text-sm leading-6 text-(--color-text-muted)">
              {copy.otpDemoDone}
            </p>
            <button type="button" onClick={onDone} className={submitClass}>
              {copy.done}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
