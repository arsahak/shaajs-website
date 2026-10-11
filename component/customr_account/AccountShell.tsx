import type { Dictionary } from "@/app/dictionaries";
import { AccountNav } from "@/component/customr_account/AccountNav";
import { AccountPageTransition } from "@/component/customr_account/AccountPageTransition";
import type { ReactNode } from "react";

/**
 * The layout the account pages share: the Profile / Orders / Settings menu
 * down the left side with the page beside it. On phones the menu sits on top.
 */
export function AccountShell({
  dict,
  className = "",
  children,
}: {
  dict: Dictionary;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 ${className}`}
    >
      {/* Stays in view while a long page (the order list) scrolls. */}
      <div className="lg:sticky lg:top-24">
        <AccountNav dict={dict} />
      </div>
      <AccountPageTransition>{children}</AccountPageTransition>
    </div>
  );
}

export default AccountShell;
