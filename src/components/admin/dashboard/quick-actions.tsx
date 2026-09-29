import Link from "next/link";
import { FilePlus2, ReceiptText, Wallet, PackagePlus, KanbanSquare, Download } from "lucide-react";

const ACTIONS = [
  { label: "New Quotation", href: "/admin/quotations?new=1", icon: FilePlus2 },
  { label: "New Invoice", href: "/admin/invoices?new=1", icon: ReceiptText },
  { label: "Record Payment", href: "/admin/payments?new=1", icon: Wallet },
  { label: "Add Stock", href: "/admin/inventory?new=1", icon: PackagePlus },
  { label: "Pipeline", href: "/admin/pipeline", icon: KanbanSquare },
  { label: "Reports", href: "/admin/reports", icon: Download },
];

export function QuickActions() {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
      {ACTIONS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-gold/40 hover:bg-gold/5 active:bg-gold/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">
            <Icon className="h-4 w-4" />
          </span>
          <span className="whitespace-nowrap">{label}</span>
        </Link>
      ))}
    </div>
  );
}
