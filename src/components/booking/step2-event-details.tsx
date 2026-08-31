"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { step2Schema, type Step2Values } from "@/lib/validations/booking";
import { EVENT_TYPES } from "@/lib/validations/booking";
import { useBookingFormStore } from "@/stores/booking-form-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// `event_type_other` is a UI-only field — it never leaves this step. When the
// user picks "Other" we capture their free-text answer here and send it through
// as the real `event_type`.
type Step2FormValues = Step2Values & { event_type_other?: string };

export function Step2EventDetails({ eventTypes }: { eventTypes?: string[] }) {
  const { data, updateData, nextStep, prevStep } = useBookingFormStore();

  // Options come from the admin-configured `event_types` setting, falling back
  // to the built-in list. "Other" is always kept last so the free-text escape
  // hatch is available even if an admin removes it from the list.
  const options = useMemo(() => {
    const base = eventTypes && eventTypes.length > 0 ? [...eventTypes] : [...EVENT_TYPES];
    const withoutOther = base.filter((t) => t !== "Other");
    return [...withoutOther, "Other"];
  }, [eventTypes]);

  // If a previously-saved event type isn't one of the options, it was entered
  // via "Other" — rehydrate the form back into that state.
  const savedType = data.event_type ?? "";
  const isPreset = options.includes(savedType);
  const initialSelection = savedType === "" ? "" : isPreset ? savedType : "Other";
  const initialOther = savedType !== "" && !isPreset ? savedType : "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      event_type: initialSelection,
      event_type_other: initialOther,
      event_date: data.event_date ?? "",
      event_time: data.event_time ?? "",
      venue: data.venue ?? "",
      guest_count: data.guest_count,
      budget: data.budget,
      theme: data.theme ?? "",
      color_preferences: data.color_preferences ?? "",
    },
  });

  const eventType = watch("event_type");
  const isOther = eventType === "Other";

  function onSubmit(values: Step2FormValues) {
    const { event_type_other, ...rest } = values;
    let finalType = values.event_type;

    if (values.event_type === "Other") {
      const custom = (event_type_other ?? "").trim();
      if (custom.length < 2) {
        setError("event_type_other", {
          type: "manual",
          message: "Please describe your event type",
        });
        return;
      }
      finalType = custom;
    }

    updateData({ ...rest, event_type: finalType });
    nextStep();
  }

  const today = new Date().toISOString().slice(0, 10);

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
        <h2 className="font-display text-2xl">Tell us about your event</h2>
        <p className="text-sm text-muted-foreground">
          The more detail you share, the better we can prepare.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Event Type</Label>
        <Select
          value={eventType}
          onValueChange={(v) => {
            setValue("event_type", v, { shouldValidate: true });
            if (v !== "Other") clearErrors("event_type_other");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an event type" />
          </SelectTrigger>
          <SelectContent>
            {options.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.event_type && (
          <p className="text-xs text-destructive">{errors.event_type.message}</p>
        )}

        {isOther && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="event_type_other" className="text-sm font-normal text-muted-foreground">
              Please specify your event type
            </Label>
            <Input
              id="event_type_other"
              placeholder="e.g. Bartabanda, Pasni, Housewarming"
              {...register("event_type_other", {
                onChange: () => clearErrors("event_type_other"),
              })}
            />
            {errors.event_type_other && (
              <p className="text-xs text-destructive">{errors.event_type_other.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_date">Event Date</Label>
          <Input id="event_date" type="date" min={today} {...register("event_date")} />
          {errors.event_date && (
            <p className="text-xs text-destructive">{errors.event_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="event_time">Event Time (optional)</Label>
          <Input id="event_time" type="time" {...register("event_time")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" placeholder="e.g. Hotel Yak & Yeti, Kathmandu" {...register("venue")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guest_count">Number of Guests</Label>
          <Input id="guest_count" type="number" min={1} placeholder="e.g. 250" {...register("guest_count")} />
          {errors.guest_count && (
            <p className="text-xs text-destructive">{errors.guest_count.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Estimated Budget (Rs.)</Label>
          <Input id="budget" type="number" min={0} placeholder="e.g. 500000" {...register("budget")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Input id="theme" placeholder="e.g. Royal Garden" {...register("theme")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color_preferences">Color Preferences</Label>
          <Input id="color_preferences" placeholder="e.g. Ivory & Gold" {...register("color_preferences")} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="luxury" size="lg" className="flex-1">
          Continue to Services
        </Button>
      </div>
    </motion.form>
  );
}
