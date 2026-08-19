"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire this up once a form backend / endpoint is decided.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-line bg-white px-8 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald" />
        <h3 className="font-display text-2xl text-ink">Thank you.</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          We&apos;ve received your message and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.5rem] border border-line bg-white p-7 md:p-9">
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
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
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
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
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
          className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
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
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
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
            className="mt-2 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
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
          className="mt-2 w-full resize-none rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-emerald"
          placeholder="Venue, guest count, the feeling you're going for..."
        />
      </div>

      <button
        type="submit"
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cream transition-all duration-500 ease-editorial hover:bg-emerald sm:w-auto"
      >
        Send Message
        <Send className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
