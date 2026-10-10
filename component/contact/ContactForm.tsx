"use client";

import { sendContactMessageAction } from "@/app/actions/contact";
import { CONTACT_TOPICS, type ContactTopic } from "@/app/data/contact";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

interface ContactFormProps {
  initialTopic?: ContactTopic;
  /** Signed-in customer's details, to save them typing what we already know. */
  defaultName?: string;
  defaultEmail?: string;
}

const MESSAGE_MAX = 1500;

/**
 * Sends the enquiry to the support inbox (the dashboard's Messages list)
 * through the backend's contact endpoint.
 */
export function ContactForm({
  initialTopic = "general",
  defaultName = "",
  defaultEmail = "",
}: ContactFormProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot: hidden from people, so only form-spam bots ever fill it in.
  const [website, setWebsite] = useState("");

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await sendContactMessageAction({
        name,
        email,
        phone,
        topic: CONTACT_TOPICS.find((option) => option.value === topic)?.label,
        orderNumber,
        message,
        website,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSentTo(email.trim());
      setOrderNumber("");
      setMessage("");
    });
  };

  if (sentTo !== null) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-bg) px-6 py-10 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--color-success) text-white">
          <CircleCheck size={28} />
        </span>
        <h3 className="text-xl">Message sent</h3>
        <p className="max-w-md text-sm text-(--color-text-muted)">
          Thanks for getting in touch. Our support team has your message and
          will reply to <strong>{sentTo}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="btn-outline btn-pill mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-start">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone">Phone (optional)</label>
          <input
            id="contact-phone"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-topic">Topic</label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value as ContactTopic)}
          >
            {CONTACT_TOPICS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-order">Order number (optional)</label>
        <input
          id="contact-order"
          type="text"
          maxLength={40}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-message">How can we help?</label>
        <textarea
          id="contact-message"
          required
          rows={6}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Honeypot — kept out of sight and out of the tab order. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-(--radius-lg) border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-(--color-error)"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-(--color-text-muted)">
          We reply by email, usually within a day.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary btn-pill shrink-0"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

export default ContactForm;
