"use client";

import { subscribeNewsletterAction } from "@/app/actions/contact";
import { Loader2, Send } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import toast from "react-hot-toast";

interface NewsletterFormProps {
  placeholder: string;
  submitLabel: string;
}

const messages = {
  success: "Thanks for subscribing!",
  duplicate: "You are already subscribed.",
};

/**
 * The footer's newsletter box — email only. Each address goes to the support
 * inbox (the dashboard's Messages list, source "Newsletter") as a sign-up.
 */
export function NewsletterForm({
  placeholder,
  submitLabel,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await subscribeNewsletterAction(email);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.duplicate ? messages.duplicate : messages.success);
      setEmail("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg) p-1 transition-colors focus-within:border-(--color-primary) focus-within:bg-(--color-surface) focus-within:shadow-[0_0_0_3px_var(--color-primary-faint)]"
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        {placeholder}
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 border-0 bg-transparent px-3 py-0 shadow-none outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        aria-label={submitLabel}
        title={submitLabel}
        className="btn-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <Send
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
          />
        )}
      </button>
    </form>
  );
}

export default NewsletterForm;
