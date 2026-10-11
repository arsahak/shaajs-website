"use client";

import { signoutAction } from "@/app/actions/auth";
import type { UserProfile } from "@/app/actions/user";
import { formatPhoneDisplay } from "@/app/data/phone-countries";
import type { Dictionary } from "@/app/dictionaries";
import { useTheme, type Theme } from "@/component/providers/ThemeProvider";
import { AtSign, LogOut, Monitor, Moon, Phone, Sun } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface CustomerSettingsProps {
  dict: Dictionary;
  profile: UserProfile;
}

function SettingsCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
      <h2 className="text-base font-semibold text-(--color-dark)">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-(--color-text-muted)">{hint}</p>
      {children}
    </section>
  );
}

/** The signed-in customer's settings: how the site looks, how they sign in, signing out. */
export function CustomerSettings({ dict, profile }: CustomerSettingsProps) {
  const copy = dict.account;
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: copy.theme_light, icon: Sun },
    { value: "dark", label: copy.theme_dark, icon: Moon },
    { value: "system", label: copy.theme_system, icon: Monitor },
  ];

  const contacts = [
    {
      icon: Phone,
      label: copy.phone,
      value: profile.phone ? formatPhoneDisplay(profile.phone) : "",
    },
    { icon: AtSign, label: copy.email, value: profile.email ?? "" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title={copy.appearance} hint={copy.appearance_hint}>
        <div
          role="radiogroup"
          aria-label={copy.appearance}
          className="grid grid-cols-3 gap-2 sm:max-w-md"
        >
          {themes.map(({ value, label, icon: Icon }) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className={`flex h-11 items-center justify-center gap-2 rounded-(--radius-md) border-2 px-3 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-(--color-primary) bg-(--color-primary-faint) text-(--color-primary)"
                    : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary)/50 hover:text-(--color-dark)"
                }`}
              >
                <Icon aria-hidden="true" size={16} className="shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard title={copy.sign_in_details} hint={copy.sign_in_details_hint}>
        <div className="flex flex-col gap-3">
          {contacts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon
                aria-hidden="true"
                size={17}
                className="shrink-0 text-(--color-primary)"
              />
              <span className="w-16 shrink-0 text-(--color-text-muted)">
                {label}
              </span>
              <span
                className={`min-w-0 truncate ${
                  value
                    ? "font-medium text-(--color-dark)"
                    : "text-(--color-text-light)"
                }`}
              >
                {value || copy.not_set}
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/account/edit"
          className="mt-4 inline-flex text-sm font-semibold text-(--color-primary) hover:text-(--color-primary-dark)"
        >
          {copy.change}
        </Link>
      </SettingsCard>

      <SettingsCard title={dict.nav.sign_out} hint={copy.sign_out_hint}>
        <form action={signoutAction}>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-(--color-error) px-5 text-sm font-semibold text-(--color-error) transition-colors hover:bg-(--color-error) hover:text-white"
          >
            <LogOut aria-hidden="true" size={15} className="shrink-0" />
            {dict.nav.sign_out}
          </button>
        </form>
      </SettingsCard>
    </div>
  );
}

export default CustomerSettings;
