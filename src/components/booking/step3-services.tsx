"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Sparkles,
  Camera,
  Video,
  Music,
  UtensilsCrossed,
  Lightbulb,
  LayoutPanelTop,
  Brush,
  Flower2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { step3Schema, type Step3Values, SERVICE_OPTIONS } from "@/lib/validations/booking";
import { bookingFormSchema } from "@/lib/validations/booking";
import { useBookingFormStore } from "@/stores/booking-form-store";
import { submitBooking } from "@/actions/booking-actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Camera,
  Video,
  Music,
  UtensilsCrossed,
  Lightbulb,
  LayoutPanelTop,
  Brush,
  Flower2,
};

export function Step3Services() {
  const { data, updateData, prevStep, setSubmitting, isSubmitting, setSubmittedBookingCode } =
    useBookingFormStore();

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      services: data.services ?? [],
      custom_notes: data.custom_notes ?? "",
    },
  });

  const selected = watch("services") ?? [];

  function toggleService(key: string) {
    const next = selected.includes(key)
      ? selected.filter((s) => s !== key)
      : [...selected, key];
    setValue("services", next, { shouldValidate: true });
  }

  async function onSubmit(values: Step3Values) {
    const finalData = { ...data, ...values };
    const parsed = bookingFormSchema.safeParse(finalData);

    if (!parsed.success) {
      toast.error("Please double-check your details and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitBooking(parsed.data);
      if (result.success && result.bookingCode) {
        updateData(values);
        setSubmittedBookingCode(result.bookingCode);
        toast.success("Your booking has been received!");
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("We couldn't reach our servers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl">What can we help with?</h2>
        <p className="text-sm text-muted-foreground">
          Select every service you&apos;d like included — you can refine this later with our team.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        {SERVICE_OPTIONS.map(({ key, label, icon }) => {
          const Icon = ICONS[icon];
          const isSelected = selected.includes(key);
          return (
            <button
              type="button"
              key={key}
              onClick={() => toggleService(key)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 text-center text-xs font-medium transition-all",
                isSelected
                  ? "border-gold bg-gold/10 text-gold-dark shadow-sm"
                  : "border-border text-muted-foreground hover:border-gold/40"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
      {errors.services && <p className="text-xs text-destructive">{errors.services.message}</p>}

      <div className="space-y-2">
        <Label htmlFor="custom_notes">Custom Notes (optional)</Label>
        <Textarea
          id="custom_notes"
          placeholder="Anything else we should know — special requests, accessibility needs, inspiration..."
          {...register("custom_notes")}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={prevStep}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" variant="luxury" size="lg" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Booking Request"
          )}
        </Button>
      </div>
    </motion.form>
  );
}
