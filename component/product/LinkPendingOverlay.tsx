"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";

/**
 * Covers its card with a light blur and a spinner while the link it sits in
 * is still loading its page. Render it inside a `<Link>` whose card is the
 * nearest positioned ancestor.
 */
export function LinkPendingOverlay() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      // Always rendered and only faded in, after a short wait — a page that
      // opens at once never flashes it.
      className={`absolute inset-0 z-20 flex items-center justify-center bg-(--color-surface)/80 backdrop-blur-[2px] transition-opacity duration-200 ${
        pending ? "opacity-100 delay-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-(--color-surface) text-(--color-primary) shadow-md">
        {pending && <Loader2 size={20} className="animate-spin" />}
      </span>
    </span>
  );
}

export default LinkPendingOverlay;
