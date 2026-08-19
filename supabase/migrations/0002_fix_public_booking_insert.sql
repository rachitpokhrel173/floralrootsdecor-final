-- =====================================================================
-- Fix: public booking form submission fails silently
--
-- Root cause: `public_can_insert_booking` only grants INSERT to anon.
-- The client code does `.insert(...).select("id, booking_code").single()`,
-- and Postgres RLS filters RETURNING rows through SELECT policies — so
-- with no SELECT policy for anon, RETURNING yields 0 rows even though
-- the insert succeeded, and .single() errors out.
--
-- We do NOT want to add a public SELECT policy on `bookings` (the anon
-- key is public in the browser bundle, so that would let anyone read
-- every customer's name/phone/email/notes via the REST API).
--
-- Instead: a SECURITY DEFINER RPC that inserts the booking + its
-- services in one transaction and returns only `id, booking_code`.
-- =====================================================================

create or replace function public.create_booking_public(
  p_full_name text,
  p_phone text,
  p_email text,
  p_preferred_contact contact_method,
  p_event_type text,
  p_event_date date,
  p_event_time time,
  p_venue text,
  p_guest_count integer,
  p_budget numeric,
  p_theme text,
  p_color_preferences text,
  p_custom_notes text,
  p_services text[]
)
returns table (id uuid, booking_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
  v_booking_code text;
  v_service text;
begin
  insert into public.bookings (
    full_name, phone, email, preferred_contact,
    event_type, event_date, event_time, venue,
    guest_count, budget, theme, color_preferences,
    custom_notes, status, source
  )
  values (
    p_full_name, p_phone, p_email, p_preferred_contact,
    p_event_type, p_event_date, p_event_time, p_venue,
    p_guest_count, p_budget, p_theme, p_color_preferences,
    p_custom_notes, 'new', 'website'
  )
  returning bookings.id, bookings.booking_code into v_booking_id, v_booking_code;

  if p_services is not null then
    foreach v_service in array p_services loop
      insert into public.booking_services (booking_id, service_name)
      values (v_booking_id, v_service);
    end loop;
  end if;

  return query select v_booking_id, v_booking_code;
end;
$$;

-- Only the anon role (public booking form) and authenticated staff may
-- call this. Revoke from PUBLIC first so nothing else picks it up.
revoke all on function public.create_booking_public from public;
grant execute on function public.create_booking_public to anon, authenticated;
