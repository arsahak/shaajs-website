"use client";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "@/component/icons/SocialIcons";
import { easeSmooth } from "@/component/motion/variants";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface ProductShareProps {
  title: string;
  className?: string;
}

type Status = "copied" | "instagram" | null;

const shareTargets = {
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  linkedin: (url: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  x: (url: string, title: string) =>
    `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
};

// Page URL without query/hash, so shared links stay clean and canonical.
function currentUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function openSharePopup(href: string) {
  const width = 600;
  const height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  window.open(
    href,
    "share",
    `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`,
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is blocked on insecure origins / older browsers.
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    input.remove();
    return ok;
  }
}

/**
 * The share button on the product page: a round icon that opens a small
 * dialog with the social networks to share to and the product's link to copy.
 */
export function ProductShare({ title, className = "" }: ProductShareProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  // Read when the dialog opens — there is no `window` on the server.
  const [url, setUrl] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // While open: Escape closes it, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openDialog = () => {
    setUrl(currentUrl());
    setStatus(null);
    setOpen(true);
  };

  const flash = (next: Status) => {
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), 2500);
  };

  const handleCopy = async () => {
    if (await copyText(currentUrl())) flash("copied");
  };

  // Instagram has no web share link: use the native share sheet where it
  // exists (phones — Instagram is listed there), otherwise copy the link.
  const handleInstagram = async () => {
    const link = currentUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    if (await copyText(link)) flash("instagram");
  };

  const iconClass = "h-5 w-5 shrink-0";
  const networks: {
    name: string;
    brand: string;
    hoverBackground?: string;
    hoverForeground?: string;
    onClick: () => void;
    icon: ReactNode;
  }[] = [
    {
      name: "Facebook",
      brand: "#1877F2",
      onClick: () => openSharePopup(shareTargets.facebook(currentUrl())),
      icon: <FacebookIcon className={iconClass} />,
    },
    {
      name: "Instagram",
      brand: "#E1306C",
      hoverBackground:
        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
      onClick: handleInstagram,
      icon: <InstagramIcon className={iconClass} />,
    },
    {
      name: "LinkedIn",
      brand: "#0A66C2",
      onClick: () => openSharePopup(shareTargets.linkedin(currentUrl())),
      icon: <LinkedinIcon className={iconClass} />,
    },
    {
      name: "X",
      brand: "var(--color-dark)",
      hoverForeground: "var(--color-bg)",
      onClick: () => openSharePopup(shareTargets.x(currentUrl(), title)),
      icon: <XIcon className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Share this product"
        aria-haspopup="dialog"
        title="Share"
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) p-0 text-(--color-dark) shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-primary) hover:text-(--color-primary) hover:shadow-md active:scale-95 ${className}`}
      >
        <Share2 aria-hidden="true" className="h-4 w-4 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="share-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeSmooth }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 backdrop-blur-sm"
          >
            <div
              // Closes on a press that starts on the backdrop itself.
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
              className="flex min-h-full items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Share this product"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: easeSmooth }}
                className="relative w-full max-w-[420px] rounded-(--radius-2xl) bg-(--color-surface) p-6 shadow-(--shadow-xl)"
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-(--color-bg) p-0 text-(--color-dark) transition-colors hover:bg-(--color-border)"
                >
                  <X className="h-[18px] w-[18px] shrink-0" />
                </button>

                <h2 className="pe-10 text-lg font-bold text-(--color-dark)">
                  Share this product
                </h2>
                <p className="mt-1 line-clamp-2 pe-10 text-sm text-(--color-text-muted)">
                  {title}
                </p>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {networks.map((network) => (
                    <div
                      key={network.name}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <ShareButton
                        label={`Share on ${network.name}`}
                        brand={network.brand}
                        hoverBackground={network.hoverBackground}
                        hoverForeground={network.hoverForeground}
                        onClick={network.onClick}
                      >
                        {network.icon}
                      </ShareButton>
                      <span className="text-xs text-(--color-text-muted)">
                        {network.name}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-5 mb-1.5 text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">
                  Or copy the link
                </p>
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    readOnly
                    value={url}
                    aria-label="Product link"
                    onFocus={(event) => event.currentTarget.select()}
                    className="h-11 min-w-0 flex-1 rounded-lg bg-(--color-bg) px-3 text-sm text-(--color-text-muted) focus:border-(--color-dark) focus:shadow-none focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-colors ${
                      status === "copied"
                        ? "bg-(--color-success)"
                        : "bg-black hover:bg-black/90"
                    }`}
                  >
                    {status === "copied" ? (
                      <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                    ) : (
                      <Copy aria-hidden="true" className="h-4 w-4 shrink-0" />
                    )}
                    {status === "copied" ? "Copied" : "Copy"}
                  </button>
                </div>

                <p
                  aria-live="polite"
                  className="mt-2 text-xs text-(--color-success) empty:hidden"
                >
                  {status === "instagram" &&
                    "Link copied — paste it into your Instagram story, post or DM."}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Neutral circle with the icon in brand color; fills with the brand on hover.
function ShareButton({
  label,
  brand,
  hoverBackground,
  hoverForeground,
  onClick,
  children,
}: {
  label: string;
  brand: string;
  /** Overrides the hover fill (e.g. Instagram's gradient). */
  hoverBackground?: string;
  /** Icon color on hover — defaults to white. */
  hoverForeground?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={
        {
          "--brand": brand,
          "--brand-bg": hoverBackground ?? brand,
          "--brand-fg": hoverForeground ?? "#fff",
        } as CSSProperties
      }
      className="group/share relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-surface) p-0 text-(--brand) shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:text-(--brand-fg) hover:shadow-[0_6px_16px_-4px_var(--brand)] active:scale-95"
    >
      <span
        aria-hidden="true"
        style={{ background: "var(--brand-bg)" }}
        className="absolute inset-0 scale-50 rounded-full opacity-0 transition-all duration-200 group-hover/share:scale-100 group-hover/share:opacity-100"
      />
      <span className="relative">{children}</span>
    </button>
  );
}

export default ProductShare;
