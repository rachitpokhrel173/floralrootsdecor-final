import { Badge } from "@/components/ui/badge";
import { Banknote, Landmark, CreditCard, Zap, CircleDollarSign } from "lucide-react";
import type { PaymentMethod } from "@/types/database.types";

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: typeof Banknote }> = {
  cash: { label: "Cash", icon: Banknote },
  bank: { label: "Bank Transfer", icon: Landmark },
  card: { label: "Card", icon: CreditCard },
  stripe: { label: "Stripe", icon: Zap },
  other: { label: "Other", icon: CircleDollarSign },
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.other;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <Icon className="h-3 w-3" /> {config.label}
    </Badge>
  );
}
