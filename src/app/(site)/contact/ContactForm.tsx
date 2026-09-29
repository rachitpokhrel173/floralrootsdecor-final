"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { submitContactMessageAction } from "@/actions/contact-actions";

const eventTypes = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Corporate Event",
  "Traditional Ceremony",
  "Other",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    startTransition(async () => {
      const res = await submitContactMessageAction(data);
      if (res.success) setSubmitted(true);
      else setError(res.error);
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-line bg-white px-8 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-leaf" />
        <h3 className="font-display text-2xl text-ink">Thank you.</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          We&apos;ve received your message and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.5rem] border border-line bg-white p-7 md:p-9">
      {/* Honeypot: hidden from people, catches spam bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
            placeholder="+977 98XXXXXXXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
          placeholder="you@example.com"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventType" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
            defaultValue=""
          >
            <option value="" disabled>
              Select event type
            </option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eventDate" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
            Event Date
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">
          Tell Us About Your Event
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-leaf"
          placeholder="Venue, guest count, the feeling you're going for..."
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex disabled:cursor-wait disabled:opacity-70 w-full items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cream transition-all duration-500 ease-editorial hover:bg-leaf sm:w-auto"
      >
        {isPending ? "Sending…" : "Send Message"}
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5" />
        )}
      </button>
    </form>
  );
}
