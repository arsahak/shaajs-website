"use client";

import { requestSigninOtpAction } from "@/app/actions/auth";
import { submitClass } from "@/component/auth/authStyles";
import { OtpInput } from "@/component/auth/OtpInput";
import { otpSignInCopy } from "@/component/auth/OtpSignIn";
import { easeSmooth } from "@/component/motion/variants";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import toast from "react-hot-toast";

interface OrderVerifyDialogProps {
  /** The email/phone the code is tied to, as the backend normalized it. */
  identifier: string;
  /** The same contact as shown back to the customer. */
  sentTo: string;
  channel: "phone" | "email";
  /** When the current code was sent (ms) — the resend wait counts from it. */
  sentAt: number;
  /**
   * The customer has typed the code: the parent confirms it and places the
   * order in one go. Resolves to a message when the code itself was wrong
   * (shown here, to try again), or to `null` once the parent has taken over —
   * the order is placed, or something about the order needs fixing.
   */
  onSubmitCode: (code: string) => Promise<string | null>;
  /** Fired when a new code goes out, with the time it was sent. */
  onResent: (sentAt: number) => void;
  onClose: () => void;
}

const copy = {
  title: "Verify to place your order",
  verify: "Verify & place order",
  placing: "Placing your order…",
};

const OTP_LENGTH = 6;
// Same wait the backend enforces between two codes.
const RESEND_COOLDOWN_SECONDS = 60;

const linkButtonClass =
  "p-0 text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark) disabled:cursor-not-allowed disabled:text-(--color-text-light)";

const secondsLeft = (sentAt: number) =>
  Math.max(
    0,
    RESEND_COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000),
  );

/**
 * The step between "Place Order" and the order itself for a customer who
 * isn't signed in: a one-time code sent to the phone number or email they
 * gave. Typing it confirms the contact, signs them in — creating their
 * account if that contact has none — and places the order, all in one go.
 */
export function OrderVerifyDialog({
  identifier,
  sentTo,
  channel,
  sentAt,
  onSubmitCode,
  onResent,
  onClose,
}: OrderVerifyDialogProps) {
  const shared = otpSignInCopy;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"placing" | "resending" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(() =>
    secondsLeft(sentAt),
  );

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // While open: Escape closes it, and the page behind doesn't scroll.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, onClose]);

  const verify = async (code: string) => {
    if (busy) return;
    if (code.length < OTP_LENGTH) {
      setError(shared.otpIncomplete);
      return;
    }

    setError("");
    setBusy("placing");
    const codeError = await onSubmitCode(code);
    // `null`: the parent has taken over and closes this dialog.
    if (codeError === null) return;
    setBusy(null);
    setOtp("");
    setError(codeError);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void verify(otp);
  };

  const resend = async () => {
    if (busy) return;
    setOtp("");
    setError("");
    setBusy("resending");
    const result = await requestSigninOtpAction(identifier);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onResent(Date.now());
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success(shared.otpResent);
  };

  // Closes on a press that starts on the backdrop itself — not one that
  // starts inside the dialog and ends outside it.
  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !busy) onClose();
  };

  const working = busy === "placing";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: easeSmooth }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm"
    >
      <div
        onMouseDown={closeOnBackdrop}
        className="flex min-h-full items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: easeSmooth }}
          className="relative w-full max-w-[440px] rounded-(--radius-2xl) bg-(--color-surface) p-6 shadow-(--shadow-xl) sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={Boolean(busy)}
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-(--color-bg) p-0 text-(--color-dark) transition-colors hover:bg-(--color-border) disabled:opacity-50"
          >
            <X className="h-[18px] w-[18px] shrink-0" />
          </button>

          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
              <ShieldCheck size={24} />
            </span>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-(--color-dark)">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--color-text-muted)">
              {shared.otpSubtitle}{" "}
              <span className="font-semibold break-all text-(--color-dark)">
                {sentTo}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                  // The last digit sends it — no extra tap needed.
                  if (value.length === OTP_LENGTH) void verify(value);
                }}
                length={OTP_LENGTH}
                invalid={Boolean(error)}
              />
              {error && (
                <p
                  role="alert"
                  className="mt-2 text-center text-sm text-(--color-error)"
                >
                  {error}
                </p>
              )}
            </div>

            <button type="submit" disabled={working} className={submitClass}>
              {working ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {copy.placing}
                </>
              ) : (
                <>
                  {copy.verify}
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
                onClick={onClose}
                disabled={Boolean(busy)}
                className={linkButtonClass}
              >
                {shared.otpChange[channel]}
              </button>
              <button
                type="button"
                onClick={() => void resend()}
                disabled={Boolean(busy) || resendCooldown > 0}
                className={linkButtonClass}
              >
                {resendCooldown > 0
                  ? `${shared.otpResend} (${resendCooldown}s)`
                  : shared.otpResend}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
