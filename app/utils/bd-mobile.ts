// A Bangladeshi mobile number however it is typed — 01XXXXXXXXX, 1XXXXXXXXX
// or +8801XXXXXXXXX, with or without spaces and dashes. The same rule as the
// backend's BD_MOBILE_REGEX (backend/utils/signinOtp.ts), so a number the
// storefront accepts is never turned away there.
const BD_MOBILE_REGEX = /^(?:\+?880|0)?(1[3-9]\d{8})$/;

/** The number as +8801XXXXXXXXX, or null when it isn't a Bangladeshi mobile. */
export function toBdMobile(input: string): string | null {
  const match = input.replace(/[\s-]/g, "").match(BD_MOBILE_REGEX);
  return match ? `+880${match[1]}` : null;
}

/** +8801XXXXXXXXX shown back to the visitor: `+880 1712-345678`. */
export function formatBdMobile(e164: string): string {
  const local = e164.slice(4);
  return `+880 ${local.slice(0, 4)}-${local.slice(4)}`;
}
