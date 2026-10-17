"use client";

import { toBdMobile } from "@/app/utils/bd-mobile";
import { Phone } from "lucide-react";
import { useState } from "react";

interface BdPhoneInputProps {
  id?: string;
  name: string;
  /** A number already on the account, e.g. "+8801XXXXXXXXX". */
  defaultValue?: string;
  required?: boolean;
  invalidMessage: string;
  className?: string;
}

// The number after +880 to start the box with: an existing Bangladeshi
// mobile without its country code, anything else left for the visitor.
const initialDigits = (value?: string) => {
  const mobile = value ? toBdMobile(value) : null;
  return mobile ? mobile.slice(4) : "";
};

/**
 * A Bangladeshi mobile number, laid out like the sign-in field: the fixed
 * +880 in front, then the number, typed as 01XXXXXXXXX or 1XXXXXXXXX alike.
 * The form gets it as +8801XXXXXXXXX under `name` — empty while what is
 * typed isn't a valid mobile, which the form treats as missing.
 */
export function BdPhoneInput({
  id,
  name,
  defaultValue,
  required,
  invalidMessage,
  className = "",
}: BdPhoneInputProps) {
  const [value, setValue] = useState(() => initialDigits(defaultValue));
  const [touched, setTouched] = useState(false);

  const mobile = toBdMobile(value);
  const invalid = touched && value.trim() !== "" && !mobile;

  return (
    <div className={className}>
      <div
        className={`flex h-12 items-stretch overflow-hidden rounded-lg border bg-(--color-surface) transition-colors focus-within:border-(--color-dark) ${
          invalid ? "border-(--color-error)" : "border-(--color-border)"
        }`}
      >
        <span className="flex shrink-0 items-center gap-3 ps-4 text-base font-semibold text-(--color-dark) sm:text-sm">
          <Phone
            aria-hidden="true"
            size={18}
            className="text-(--color-text-light)"
          />
          +880
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="1XXX-XXXXXX"
          required={required}
          aria-invalid={invalid}
          value={value}
          onChange={(event) =>
            setValue(event.target.value.replace(/[^\d+\s-]/g, ""))
          }
          onBlur={() => setTouched(true)}
          // 16px on phones: iOS Safari zooms the page when smaller.
          className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent ps-2 pe-4 text-base shadow-none outline-none placeholder:text-(--color-text-light) sm:text-sm"
        />
      </div>
      {invalid && (
        <p className="mt-1.5 text-xs text-(--color-error)">{invalidMessage}</p>
      )}
      <input type="hidden" name={name} value={mobile ?? ""} />
    </div>
  );
}
