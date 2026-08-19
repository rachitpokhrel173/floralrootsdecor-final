import { z } from "zod";
import type { UserRole } from "@/types/database.types";

export const STAFF_ROLES: UserRole[] = [
  "admin",
  "manager",
  "decorator",
  "photographer",
  "videographer",
  "driver",
  "designer",
  "freelancer",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  decorator: "Decorator",
  photographer: "Photographer",
  videographer: "Videographer",
  driver: "Driver",
  designer: "Designer",
  freelancer: "Freelancer",
};

// Roles that carry elevated permissions (full data access, can manage
// staff). Used to warn admins before granting them, not to enforce
// anything client-side — RLS is the real gate.
export const ELEVATED_ROLES: UserRole[] = ["admin", "manager"];

export const createStaffSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(STAFF_ROLES as [UserRole, ...UserRole[]]),
  designation: z.string().trim().max(80).optional().or(z.literal("")),
  hourly_rate: z.coerce.number().min(0).optional(),
  monthly_salary: z.coerce.number().min(0).optional(),
  temp_password: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(STAFF_ROLES as [UserRole, ...UserRole[]]).optional(),
  designation: z.string().trim().max(80).optional().or(z.literal("")),
  hourly_rate: z.coerce.number().min(0).optional().nullable(),
  monthly_salary: z.coerce.number().min(0).optional().nullable(),
});

export type UpdateStaffValues = z.infer<typeof updateStaffSchema>;

export function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
