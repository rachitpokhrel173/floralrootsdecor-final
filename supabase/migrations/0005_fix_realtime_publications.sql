-- =====================================================================
-- Fix: Realtime sync silently not working for Customers, Quotations,
-- and Invoices.
--
-- Root cause: the admin UI subscribes to postgres_changes on these
-- tables (see src/hooks/use-customers.ts, use-quotations.ts,
-- use-invoices.ts), but the tables were never added to the
-- `supabase_realtime` publication in 0001_init_schema.sql. Without
-- that, Supabase Realtime never emits change events for them — the
-- subscription silently receives nothing. Data still loads on initial
-- fetch, but nothing updates live across tabs/sessions until a manual
-- refresh (or a `revalidatePath`-triggered navigation).
--
-- Written to be safe to re-run: skips any table already published.
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array['customers', 'quotations', 'invoices'] loop
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
