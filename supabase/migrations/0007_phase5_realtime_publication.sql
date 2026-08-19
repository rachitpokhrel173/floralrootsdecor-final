-- =====================================================================
-- Phase 5 tables (Staff, Vendors, Inventory) were never added to the
-- supabase_realtime publication in 0001_init_schema.sql — same class of
-- bug as 0005 for customers/quotations/invoices. Without this, the admin
-- UI's postgres_changes subscriptions for these tables silently receive
-- nothing until a manual refresh.
--
-- Written to be safe to re-run: skips any table already published.
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'users',
    'staff_availability',
    'vendors',
    'vendor_payments',
    'inventory',
    'inventory_bookings'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
