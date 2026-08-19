import { z } from "zod";

export const VENDOR_CATEGORIES = [
  "catering",
  "photography",
  "videography",
  "makeup",
  "dj",
  "hotels",
  "flower_suppliers",
  "furniture",
  "lighting",
  "transport",
  "other",
] as const;

export const VENDOR_CATEGORY_LABELS: Record<(typeof VENDOR_CATEGORIES)[number], string> = {
  catering: "Catering",
  photography: "Photography",
  videography: "Videography",
  makeup: "Makeup",
  dj: "DJ",
  hotels: "Hotels",
  flower_suppliers: "Flower Suppliers",
  furniture: "Furniture",
  lighting: "Lighting",
  transport: "Transport",
  other: "Other",
};

export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(150),
  category: z.enum(VENDOR_CATEGORIES),
  contact_person: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

export const vendorPaymentSchema = z.object({
  amount: z.coerce.number().min(1, "Enter an amount greater than 0"),
  booking_id: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type VendorPaymentFormValues = z.infer<typeof vendorPaymentSchema>;
