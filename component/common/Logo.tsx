import Image from "next/image";

interface LogoProps {
  /** Size and colour utilities — the wordmark sets neither itself. */
  className?: string;
  /** Which mark sits beside the wordmark: white for the pink header, otherwise pink. */
  tone?: "color" | "white";
}

/**
 * The SHAAJS logo: the brand mark, then the wordmark set in Audiowide (loaded
 * in the root layout). The mark scales with the wordmark's font size.
 */
export function Logo({ className = "", tone = "color" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] font-(family-name:--font-logo) leading-none tracking-[0.06em] whitespace-nowrap ${className}`}
    >
      <Image
        src={
          tone === "white"
            ? "/assets/logo/whiteshape.png"
            : "/assets/logo/colorshape.png"
        }
        alt=""
        width={402}
        height={421}
        className="h-[1.25em] w-auto"
      />
      SHAAJS
    </span>
  );
}
