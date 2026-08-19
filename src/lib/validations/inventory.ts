import { z } from "zod";

export const INVENTORY_CATEGORIES = [
  "flowers",
  "furniture",
  "lighting",
  "stage",
  "vehicles",
  "decorations",
] as const;

export const INVENTORY_CATEGORY_LABELS: Record<(typeof INVENTORY_CATEGORIES)[number], string> = {
  flowers: "Flowers",
  furniture: "Furniture",
  lighting: "Lighting",
  stage: "Stage",
  vehicles: "Vehicles",
  decorations: "Decorations",
};

export const inventorySchema = z.object({
  name: z.string().min(1, "Item name is required").max(150),
  category: z.enum(INVENTORY_CATEGORIES),
  sku: z.string().max(60).optional().or(z.literal("")),
  barcode: z.string().max(60).optional().or(z.literal("")),
  qr_code: z.string().max(60).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(0),
  unit: z.string().max(20).optional().or(z.literal("")),
  supplier_id: z.string().optional().or(z.literal("")),
  purchase_price: z.coerce.number().min(0).optional(),
  is_available: z.boolean(),
  location: z.string().max(150).optional().or(z.literal("")),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

/** Items at or below this quantity are flagged as low stock in the UI. */
export const LOW_STOCK_THRESHOLD = 5;
