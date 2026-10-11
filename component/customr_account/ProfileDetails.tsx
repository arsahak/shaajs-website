import type { UserProfile } from "@/app/actions/user";
import { formatPhoneDisplay } from "@/app/data/phone-countries";
import type { Dictionary } from "@/app/dictionaries";
import { AtSign, CalendarDays, MapPin, Pencil, Phone, Truck } from "lucide-react";
import Link from "next/link";

interface ProfileDetailsProps {
  dict: Dictionary;
  profile: UserProfile;
}

// An account made by signing in with a code has no real name yet — the
// backend's placeholder stands in until the first order or an edit.
const PLACEHOLDER_NAME = "Customer";

/** The signed-in customer's details, with a way to edit them. */
export function ProfileDetails({ dict, profile }: ProfileDetailsProps) {
  const copy = dict.account;
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const hasName = Boolean(fullName) && fullName !== PLACEHOLDER_NAME;
  const phone = profile.phone ? formatPhoneDisplay(profile.phone) : "";
  const initial = (hasName ? fullName : profile.email || phone || "?")
    .charAt(0)
    .toUpperCase();

  const rows = [
    { icon: Phone, label: copy.phone, value: phone },
    { icon: AtSign, label: copy.email, value: profile.email ?? "" },
    { icon: MapPin, label: copy.address, value: profile.address?.area ?? "" },
    { icon: Truck, label: copy.delivery_zone, value: profile.address?.zone ?? "" },
    {
      icon: CalendarDays,
      label: copy.member_since,
      value: new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(profile.createdAt),
      ),
    },
  ];

  return (
    <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm)">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) p-5">
        <div className="flex min-w-0 items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-xl font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="mb-0 truncate text-lg font-semibold text-(--color-dark)">
              {hasName ? fullName : copy.name_missing}
            </p>
            <p className="mb-0 truncate text-sm text-(--color-text-muted)">
              {profile.email || phone}
            </p>
          </div>
        </div>
        <Link
          href="/account/edit"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-(--color-dark) px-5 text-sm font-semibold text-(--color-dark) transition-colors hover:bg-(--color-dark) hover:text-white"
        >
          <Pencil aria-hidden="true" size={15} className="shrink-0" />
          {copy.edit_profile}
        </Link>
      </div>

      <dl className="divide-y divide-(--color-border)">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start gap-3 px-5 py-4 sm:items-center"
          >
            <Icon
              aria-hidden="true"
              size={17}
              className="mt-0.5 shrink-0 text-(--color-primary) sm:mt-0"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
              <dt className="text-sm text-(--color-text-muted) sm:w-36 sm:shrink-0">
                {label}
              </dt>
              <dd
                className={`mb-0 min-w-0 text-sm break-words ${
                  value
                    ? "font-medium text-(--color-dark)"
                    : "text-(--color-text-light)"
                }`}
              >
                {value || copy.not_set}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default ProfileDetails;
