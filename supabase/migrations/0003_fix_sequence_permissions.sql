-- =====================================================================
-- Fix: "permission denied for sequence quotation_id_seq" (and the same
-- issue latent for invoice_id_seq, booking_id_seq, etc.)
--
-- Root cause: columns like quotations.quotation_number default to
-- `'QT-' || nextval('quotation_id_seq')`. Granting INSERT on a table
-- does NOT grant USAGE on a sequence its defaults read from — those
-- are separate privileges in Postgres. Our RLS policies correctly
-- allow authenticated staff to INSERT into quotations/invoices, but
-- nobody ever granted USAGE on the underlying sequences, so nextval()
-- inside the insert fails.
--
-- Fix: grant USAGE + SELECT on every sequence in public to the roles
-- that need to insert rows using them, and set default privileges so
-- any sequence created in future migrations gets the same grants
-- automatically (no more one-off fixes per new table).
-- =====================================================================

grant usage, select on all sequences in schema public to authenticated, service_role;

-- anon only needs this for the public booking flow, but the flow goes
-- through a SECURITY DEFINER function today, so this is just a safety
-- net in case that ever changes.
grant usage, select on all sequences in schema public to anon;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role, anon;
