"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  companyProfileSchema,
  eventTypesSchema,
  serviceCatalogSchema,
  type CompanyProfileValues,
  type ServiceCatalogItem,
} from "@/lib/validations/settings";

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

export async function updateCompanyProfileAction(
  values: CompanyProfileValues
): Promise<SettingsActionResult> {
  const parsed = companyProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "company_profile", value: parsed.data }, { onConflict: "key" });

  if (error) {
    // RLS will reject this for non-admin/manager users — surface a clear message.
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateEventTypesAction(eventTypes: string[]): Promise<SettingsActionResult> {
  const parsed = eventTypesSchema.safeParse(eventTypes);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "event_types", value: parsed.data }, { onConflict: "key" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateServiceCatalogAction(
  catalog: ServiceCatalogItem[]
): Promise<SettingsActionResult> {
  const parsed = serviceCatalogSchema.safeParse(catalog);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "service_catalog", value: parsed.data }, { onConflict: "key" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}
