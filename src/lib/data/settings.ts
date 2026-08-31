import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_COMPANY_PROFILE,
  type CompanyProfileValues,
  type ServiceCatalogItem,
} from "@/lib/validations/settings";
import { EVENT_TYPES } from "@/lib/validations/booking";

export interface AllSettings {
  companyProfile: CompanyProfileValues;
  eventTypes: string[];
  serviceCatalog: ServiceCatalogItem[];
}

// Fallback when the `event_types` settings row hasn't been created yet. Single
// source of truth is EVENT_TYPES in lib/validations/booking.
const DEFAULT_EVENT_TYPES: string[] = [...EVENT_TYPES];

const DEFAULT_SERVICE_CATALOG: ServiceCatalogItem[] = [
  { key: "decoration", label: "Decoration" },
  { key: "photography", label: "Photography" },
  { key: "videography", label: "Videography" },
  { key: "dj", label: "DJ" },
  { key: "catering", label: "Catering" },
  { key: "lighting", label: "Lighting" },
  { key: "stage", label: "Stage" },
  { key: "makeup", label: "Makeup" },
  { key: "floral_decoration", label: "Floral Decoration" },
];

export async function getAllSettings(): Promise<AllSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["company_profile", "event_types", "service_catalog"]);

  if (error) {
    console.error("getAllSettings: query failed", error.message);
    return {
      companyProfile: DEFAULT_COMPANY_PROFILE,
      eventTypes: DEFAULT_EVENT_TYPES,
      serviceCatalog: DEFAULT_SERVICE_CATALOG,
    };
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    companyProfile: {
      ...DEFAULT_COMPANY_PROFILE,
      ...(map.get("company_profile") as Partial<CompanyProfileValues> | undefined),
    },
    eventTypes: (map.get("event_types") as string[] | undefined) ?? DEFAULT_EVENT_TYPES,
    serviceCatalog:
      (map.get("service_catalog") as ServiceCatalogItem[] | undefined) ?? DEFAULT_SERVICE_CATALOG,
  };
}
