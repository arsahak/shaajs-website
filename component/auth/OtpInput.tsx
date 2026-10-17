"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

// How many digits every code the shop sends has — sign-in, checkout, sign-up
// and password reset. The backend's OTP_LENGTH (backend/utils/otp.ts) has to
// match.
export const OTP_LENGTH = 4;

interface OtpInputProps {
  /** The digits typed so far, e.g. "4821". */
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
}

/**
 * One box per digit. Typing moves on to the next box, Backspace steps back,
 * and a pasted code fills every box at once.
 */
export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  invalid = false,
}: OtpInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) => {
    const box = boxes.current[Math.max(0, Math.min(length - 1, index))];
    box?.focus();
    box?.select();
  };

  const handleInput = (index: number, typed: string) => {
    const digits = typed.replace(/\D/g, "");
    if (!digits) return;
    // More than one digit arrives when the phone offers the code from an SMS.
    const next = (value.slice(0, index) + digits + value.slice(index + 1)).slice(
      0,
      length,
    );
    onChange(next);
    focusBox(index + digits.length);
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      // Clears this box, or the one before it when this one is already empty.
      const target = value[index] ? index : index - 1;
      if (target < 0) return;
      onChange(value.slice(0, target) + value.slice(target + 1));
      focusBox(target);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    onChange(digits);
    focusBox(digits.length);
  };

  return (
    // A row of equal boxes, centred whatever the code's length.
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(box) => {
            boxes.current[index] = box;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid}
          autoFocus={index === 0}
          maxLength={length}
          value={value[index] ?? ""}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={`h-13 w-12 rounded-lg p-0 text-center sm:w-14 text-xl font-bold focus:border-(--color-dark) focus:shadow-none focus:outline-none ${
            invalid
              ? "border-(--color-error)"
              : value[index]
                ? "border-(--color-dark)"
                : ""
          }`}
        />
      ))}
    </div>
  );
}
