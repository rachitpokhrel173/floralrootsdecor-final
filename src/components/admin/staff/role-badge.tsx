import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/validations/staff";
import type { UserRole } from "@/types/database.types";

const ROLE_VARIANT: Record<UserRole, "luxury" | "info" | "secondary"> = {
  admin: "luxury",
  manager: "luxury",
  decorator: "info",
  photographer: "info",
  videographer: "info",
  driver: "secondary",
  designer: "info",
  freelancer: "secondary",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>;
}
