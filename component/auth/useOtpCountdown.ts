"use client";

import { useEffect, useState } from "react";

// The backend's timings (backend/utils/otp.ts): a code is good for five
// minutes, and another can be asked for a minute after the last one.
export const OTP_EXPIRY_SECONDS = 5 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/** Seconds as `m:ss` — `4:07`. */
export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * How long until a new code may be asked for, and until the one sent at
 * `sentAt` (a Date.now() time) stops working — both counting down each
 * second. Before anything is sent (`null`) both are 0.
 */
export function useOtpCountdown(sentAt: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (sentAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sentAt]);

  const elapsed = sentAt === null ? Infinity : Math.floor((now - sentAt) / 1000);
  return {
    resendIn: Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsed),
    expiresIn: Math.max(0, OTP_EXPIRY_SECONDS - elapsed),
  };
}
