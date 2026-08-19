import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/shared/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shared/admin-topbar";
import { AdminMobileNav } from "@/components/admin/shared/admin-mobile-nav";
import { CommandPalette } from "@/components/admin/shared/command-palette";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar userEmail={user?.email} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <AdminMobileNav />
      <CommandPalette />
    </div>
  );
}
