"use client";

import { motion } from "framer-motion";
import { Check, Copy, PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BookingSuccess({
  bookingCode,
  onStartOver,
}: {
  bookingCode: string;
  onStartOver: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    toast.success("Booking reference copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center py-6"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-lg shadow-gold/30"
        >
          <Check className="h-7 w-7" strokeWidth={3} />
        </motion.div>
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1, 1],
              x: Math.cos((i / 6) * Math.PI * 2) * 46,
              y: Math.sin((i / 6) * Math.PI * 2) * 46,
            }}
            transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-gold"
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <PartyPopper className="h-5 w-5 text-gold" />
          <h2 className="font-display text-2xl">Booking Received!</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Thank you for choosing us. Our team will reach out shortly to discuss the details of your event.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-6 w-full max-w-xs rounded-xl border border-border bg-muted/40 p-4"
      >
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
          Booking Reference
        </p>
        <div className="flex items-center justify-center gap-2">
          <p className="font-display text-xl text-gold-dark tracking-wide">{bookingCode}</p>
          <button
            onClick={copyCode}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Copy booking reference"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        <Button variant="luxury" size="lg" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={onStartOver}>
          Submit another booking
        </Button>
      </motion.div>
    </motion.div>
  );
}
