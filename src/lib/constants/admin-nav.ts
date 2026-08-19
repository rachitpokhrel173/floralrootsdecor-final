import {
  LayoutDashboard,
  CalendarRange,
  KanbanSquare,
  Table2,
  Users,
  FileText,
  Receipt,
  Wallet,
  UserCog,
  Boxes,
  Handshake,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: Table2 },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarRange },
  { label: "Pipeline", href: "/admin/pipeline", icon: KanbanSquare },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Quotations", href: "/admin/quotations", icon: FileText },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Payments", href: "/admin/payments", icon: Wallet },
  { label: "Staff", href: "/admin/staff", icon: UserCog },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Vendors", href: "/admin/vendors", icon: Handshake },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
