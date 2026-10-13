import { DESCRIPTION_ICONS } from "@/app/utils/description-icons";

const FALLBACK_ICON = "sparkles";
const ICON_BY_NAME = new Map(DESCRIPTION_ICONS.map((icon) => [icon.name, icon]));

interface DescriptionIconProps {
  /** One of the shop's icon names ("droplets", "watch") — what the dashboard saves. */
  name?: string | null;
  className?: string;
  strokeWidth?: number;
}

/**
 * One of the shop's icons by name — the set the dashboard's icon pickers
 * offer — drawn as an outline in the current text color and sized by
 * `className`. A name that isn't in the set shows the sparkles icon.
 */
export function DescriptionIcon({
  name,
  className,
  strokeWidth = 2,
}: DescriptionIconProps) {
  const icon =
    ICON_BY_NAME.get(name || FALLBACK_ICON) ?? ICON_BY_NAME.get(FALLBACK_ICON);
  if (!icon) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      // The shapes come from this project's own icon list.
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

export default DescriptionIcon;
