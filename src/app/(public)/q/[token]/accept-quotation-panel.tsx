"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptQuotationAction } from "@/actions/public-quotation-actions";
import { formatDate } from "@/lib/utils";

export function AcceptQuotationPanel({
  token,
  clientName,
  companyName,
  acceptedBy,
  acceptedAt,
  canAccept,
}: {
  token: string;
  clientName: string;
  companyName: string;
  acceptedBy: string | null;
  acceptedAt: string | null;
  /** False when expired / rejected — the page shows its own banner then. */
  canAccept: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(clientName);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (acceptedAt) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 print:hidden">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold">Quotation accepted</p>
          <p className="text-sm text-emerald-800">
            {acceptedBy ? `Accepted by ${acceptedBy}` : "Accepted"} on {formatDate(acceptedAt)}. Thank
            you! {companyName} will be in touch about the advance payment to confirm your booking.
          </p>
        </div>
      </div>
    );
  }

  if (!canAccept) return null;

  function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await acceptQuotationAction(token, name);
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleAccept}
      className="mt-6 rounded-2xl border border-[#e7e2d8] bg-white px-5 py-5 shadow-[0_10px_40px_-18px_rgba(23,21,18,0.25)] sm:px-7 print:hidden"
    >
      <p className="font-serif text-lg font-semibold">Happy with this quotation?</p>
      <p className="mt-1 text-sm text-[#6b6862]">
        Type your name below to accept it online — no printing or signing needed.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#9c9890]">
            Full name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            autoComplete="name"
            className="h-11 w-full rounded-lg border border-[#d9d3c6] bg-white px-3 text-base outline-none focus:border-[#a67f3d] focus:ring-2 focus:ring-[#c9a961]/30"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !agreed || name.trim().length < 2}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#171512] px-6 text-sm font-semibold text-white transition hover:bg-[#2a2622] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Accept quotation
        </button>
      </div>

      <label className="mt-3 flex items-start gap-2 text-sm text-[#4a4741]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#171512]"
        />
        <span>I accept this quotation and its terms &amp; conditions.</span>
      </label>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </form>
  );
}
