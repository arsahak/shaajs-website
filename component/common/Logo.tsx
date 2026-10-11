import Image from "next/image";

interface LogoProps {
  /** Height utilities — the width follows the logo's own proportions. */
  className?: string;
  /** White for the pink header, otherwise the brand pink. */
  tone?: "color" | "white";
}

/** The SHAAJS logo: the brand mark and the wordmark, drawn as one SVG. */
export function Logo({ className = "h-8", tone = "color" }: LogoProps) {
  return (
    <Image
      src={
        tone === "white"
          ? "/assets/logo/white-logo.svg"
          : "/assets/logo/color-logo.svg"
      }
      alt="SHAAJS"
      width={830}
      height={178}
      className={`w-auto ${className}`}
    />
  );
}
