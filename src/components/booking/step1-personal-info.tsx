"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { step1Schema, type Step1Values } from "@/lib/validations/booking";
import { useBookingFormStore } from "@/stores/booking-form-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
] as const;

export function Step1PersonalInfo() {
  const { data, updateData, nextStep } = useBookingFormStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      full_name: data.full_name ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      preferred_contact: data.preferred_contact ?? "phone",
    },
  });

  const preferredContact = watch("preferred_contact");

  function onSubmit(values: Step1Values) {
    updateData(values);
    nextStep();
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
        <h2 className="font-display text-2xl">Let&apos;s start with you</h2>
        <p className="text-sm text-muted-foreground">
          Tell us a little about yourself so we can reach out about your event.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" placeholder="e.g. Sita Sharma" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="98XXXXXXXX" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred Contact Method</Label>
        <div className="grid grid-cols-3 gap-3">
          {CONTACT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => setValue("preferred_contact", value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-xs font-medium transition-all",
                preferredContact === value
                  ? "border-gold bg-gold/10 text-gold-dark"
                  : "border-border text-muted-foreground hover:border-gold/40"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" variant="luxury" size="lg" className="w-full">
        Continue to Event Details
      </Button>
    </motion.form>
  );
}
