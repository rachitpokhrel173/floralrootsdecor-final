import { z } from "zod";

export const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Corporate Event",
  "Anniversary",
  "Baby Shower",
  "Reception",
  "Religious Ceremony",
  "Bartabanda",
  "Annaprashan/Pasni",
  "Other",
] as const;

export const SERVICE_OPTIONS = [
  { key: "decoration", label: "Decoration", icon: "Sparkles" },
  { key: "photography", label: "Photography", icon: "Camera" },
  { key: "videography", label: "Videography", icon: "Video" },
  { key: "dj", label: "DJ", icon: "Music" },
  { key: "catering", label: "Catering", icon: "UtensilsCrossed" },
  { key: "lighting", label: "Lighting", icon: "Lightbulb" },
  { key: "stage", label: "Stage", icon: "LayoutPanelTop" },
  { key: "makeup", label: "Makeup", icon: "Brush" },
  { key: "floral_decoration", label: "Floral Decoration", icon: "Flower2" },
] as const;

// ---------------- Step 1: Personal Information ----------------
export const step1Schema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(120),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  preferred_contact: z.enum(["phone", "email", "whatsapp"]),
});

// ---------------- Step 2: Event Details ----------------
export const step2Schema = z.object({
  event_type: z.string().min(1, "Please select an event type"),
  event_date: z
    .string()
    .min(1, "Please select an event date")
    .refine((val) => new Date(val) >= new Date(new Date().toDateString()), {
      message: "Event date must be today or in the future",
    }),
  event_time: z.string().optional().or(z.literal("")),
  venue: z.string().max(300).optional().or(z.literal("")),
  guest_count: z.coerce.number().int().min(1, "Enter number of guests").max(100000).optional(),
  budget: z.coerce.number().min(0).optional(),
  theme: z.string().max(150).optional().or(z.literal("")),
  color_preferences: z.string().max(150).optional().or(z.literal("")),
});

// ---------------- Step 3: Services ----------------
export const step3Schema = z.object({
  services: z.array(z.string()).min(1, "Please select at least one service"),
  custom_notes: z.string().max(2000).optional().or(z.literal("")),
});

// ---------------- Full booking form ----------------
export const bookingFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
