import { navCategories } from "@/app/data/categories";
import type { Dictionary } from "@/app/dictionaries";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/component/icons/SocialIcons";
import { Banknote, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "../common/Logo";
import { ThemeSwitcher } from "../common/ThemeSwitcher";
import { NewsletterForm } from "./NewsletterForm";

interface FooterProps {
  dict: Dictionary;
}

interface FooterLink {
  label: string;
  href: string;
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <ul className="flex flex-col items-center gap-2.5 ps-0 text-center sm:items-start sm:text-start [&>li]:m-0">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const Footer = ({ dict }: FooterProps) => {
  const year = new Date().getFullYear();

  const companyLinks: FooterLink[] = [
    { label: dict.footer.about, href: "/about" },
    { label: dict.footer.careers, href: "/careers" },
    { label: dict.footer.blog, href: "/blog" },
    { label: dict.topbar.sell_on_Shaajs, href: "/sell" },
    { label: dict.footer.contact, href: "/contact" },
  ];

  const serviceLinks: FooterLink[] = [
    { label: dict.footer.help, href: "/help" },
    { label: dict.topbar.track_order, href: "/orders/track" },
    { label: dict.footer.returns, href: "/returns" },
    { label: dict.footer.shipping_info, href: "/shipping" },
    { label: dict.footer.faq, href: "/faq" },
  ];

  const categoryLinks: FooterLink[] = navCategories
    .slice(0, 6)
    .map((category) => ({
      label: category.label,
      href: category.href,
    }));

  const legalLinks: FooterLink[] = [
    { label: dict.footer.terms, href: "/terms" },
    { label: dict.footer.privacy, href: "/privacy" },
    { label: dict.footer.cookie_policy, href: "/cookies" },
  ];

  const socialLinks = [
    {
      label: "Facebook",
      href: "https://facebook.com/shaajsbd",
      Icon: FacebookIcon,
    },
    {
      label: "Instagram",
      href: "https://instagram.com/shaajsbd",
      Icon: InstagramIcon,
    },
    // { label: "X (Twitter)", href: "https://x.com/shaajs", Icon: XIcon },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@shaajsbd",
      Icon: TikTokIcon,
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@shaajs",
      Icon: YoutubeIcon,
    },
  ];

  // Brand logos live in /public/assets/payments. `cover` is for artwork that
  // is a full card face (fills the tile); the rest sit on the white tile.
  const paymentMethods = [
    { label: "Visa", src: "/assets/payments/visa.svg" },
    { label: "Mastercard", src: "/assets/payments/mastercard.svg" },
    {
      label: "American Express",
      src: "/assets/payments/amex.svg",
      cover: true,
    },
    { label: "bKash", src: "/assets/payments/bkash.png" },
    { label: "Nagad", src: "/assets/payments/nagad.png" },
    { label: "Rocket", src: "/assets/payments/rocket.png" },
  ];

  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface)">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-12">
        {/* Brand — centred on phones, left-aligned from tablet up */}
        <div className="col-span-2 text-center sm:col-span-3 sm:text-start lg:col-span-4">
          <Link
            href="/"
            className="inline-flex items-center transition-opacity hover:opacity-85"
            aria-label="Shaajs home"
          >
            <Logo className="h-9 sm:h-10" />
          </Link>
          <p className="mt-4 text-sm font-semibold text-(--color-dark)">
            {dict.footer.tagline}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-(--color-text-muted) sm:mx-0">
            {dict.footer.description}
          </p>

          <h6 className="mt-6 mb-3">{dict.footer.follow_us}</h6>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="text-center sm:text-start lg:col-span-2">
          <h6 className="mb-4">{dict.footer.company}</h6>
          <FooterLinks links={companyLinks} />
        </div>

        {/* Customer service */}
        <div className="text-center sm:text-start lg:col-span-2">
          <h6 className="mb-4">{dict.footer.customer_service}</h6>
          <FooterLinks links={serviceLinks} />
        </div>

        {/* Top categories — left out on phones to keep the footer short */}
        <div className="hidden text-start sm:block lg:col-span-2">
          <h6 className="mb-4 text-start">{dict.footer.top_categories}</h6>
          <FooterLinks links={categoryLinks} />
        </div>

        {/* Newsletter sign-up (email only) — centred on phones */}
        <div className="col-span-2 text-center sm:col-span-3 sm:text-start lg:col-span-2">
          <h6 className="mb-4">{dict.footer.newsletter_title}</h6>
          <p className="mb-4 text-sm text-(--color-text-muted)">
            {dict.footer.newsletter_subtitle}
          </p>
          <NewsletterForm
            placeholder={dict.footer.newsletter_placeholder}
            submitLabel={dict.footer.newsletter_submit}
          />
          <div className="mt-6 flex justify-center sm:justify-start">
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Payment / trust bar */}
      <div className="border-t border-(--color-border)">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium text-(--color-text-muted)">
            <ShieldCheck size={18} className="text-(--color-primary)" />
            {dict.footer.secure_payment}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {paymentMethods.map(({ label, src, cover }) => (
              <span
                key={label}
                title={label}
                className="flex h-8 w-[50px] items-center justify-center overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white"
              >
                <Image
                  src={src}
                  alt={label}
                  width={100}
                  height={64}
                  className={
                    cover
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-contain"
                  }
                />
              </span>
            ))}
            <span
              title={dict.checkoutPage.cod}
              className="flex h-8 items-center gap-1 rounded-(--radius-md) border border-(--color-border) bg-white px-2 text-[0.6875rem] font-bold tracking-wide text-black"
            >
              <Banknote
                aria-hidden="true"
                size={18}
                className="shrink-0 text-(--color-success)"
              />
              <span aria-hidden="true">COD</span>
              <span className="sr-only">{dict.checkoutPage.cod}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-(--color-border) bg-(--color-bg)">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 text-sm text-(--color-text-muted) sm:flex-row sm:flex-wrap">
          <p>
            © {year} Shaajs. {dict.footer.copyright}
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-(--color-primary)"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
