import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required").max(120),
  tagline: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  logo_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  currency: z.string().min(1).max(10),
  tax_percent: z.coerce.number().min(0).max(100),
});

export type CompanyProfileValues = z.infer<typeof companyProfileSchema>;

export const eventTypesSchema = z.array(z.string().min(1).max(60)).min(1, "Add at least one event type");

export const serviceCatalogItemSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only"),
  label: z.string().min(1).max(80),
});

export const serviceCatalogSchema = z.array(serviceCatalogItemSchema).min(1, "Add at least one service");

export type ServiceCatalogItem = z.infer<typeof serviceCatalogItemSchema>;

export const DEFAULT_COMPANY_PROFILE: CompanyProfileValues = {
  name: "Floral Roots",
  tagline: "Premium Events & Decor",
  phone: "",
  email: "",
  address: "",
  logo_url: "",
  currency: "NPR",
  tax_percent: 13,
};
