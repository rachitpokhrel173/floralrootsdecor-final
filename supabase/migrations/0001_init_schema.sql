-- =====================================================================
-- Floral R&D CRM — Initial Schema
-- Phase 1 Foundation
-- =====================================================================
-- Notes:
-- * uuid-ossp / pgcrypto for gen_random_uuid()
-- * All tables have created_at / updated_at with auto-update trigger
-- * RLS is enabled on every table. Public (anon) role can ONLY insert
--   into `bookings` and `booking_services` (the public booking form).
--   Everything else requires an authenticated staff/admin user.
-- * Realtime is enabled on tables the admin dashboard needs to live-sync.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- ENUMS
-- =====================================================================

create type user_role as enum (
  'admin', 'manager', 'decorator', 'photographer',
  'videographer', 'driver', 'designer', 'freelancer'
);

create type booking_status as enum (
  'new', 'contacted', 'meeting', 'quotation_sent', 'negotiation',
  'confirmed', 'decoration_started', 'completed', 'cancelled'
);

create type booking_priority as enum ('low', 'medium', 'high', 'urgent');

create type contact_method as enum ('phone', 'email', 'whatsapp');

create type payment_status as enum ('unpaid', 'partial', 'paid', 'refunded');

create type quotation_status as enum ('draft', 'sent', 'approved', 'rejected', 'expired');

create type invoice_status as enum ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');

create type payment_method as enum ('cash', 'bank', 'card', 'stripe', 'other');

create type task_status as enum ('pending', 'in_progress', 'completed', 'blocked');

create type notification_type as enum (
  'new_booking', 'payment_received', 'upcoming_event', 'staff_assignment',
  'reminder', 'quotation_approved', 'invoice_paid', 'system'
);

-- =====================================================================
-- UTILITY: updated_at trigger function
-- =====================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- USERS (staff/admin accounts, mirrors auth.users)
-- =====================================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  role user_role not null default 'freelancer',
  designation text,
  is_active boolean not null default true,
  hourly_rate numeric(10,2),
  monthly_salary numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_users_updated_at before update on public.users
  for each row execute function set_updated_at();

-- =====================================================================
-- CUSTOMERS
-- =====================================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  preferred_contact contact_method not null default 'phone',
  address text,
  budget_range_min numeric(12,2),
  budget_range_max numeric(12,2),
  favorite_decorations text[],
  is_favorite boolean not null default false,
  tags text[] default '{}',
  notes text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_customers_updated_at before update on public.customers
  for each row execute function set_updated_at();
create index idx_customers_phone on public.customers(phone);
create index idx_customers_email on public.customers(email);

-- =====================================================================
-- BOOKINGS
-- =====================================================================

create sequence if not exists booking_id_seq start 1001;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default ('EVT-' || nextval('booking_id_seq')::text),

  customer_id uuid references public.customers(id) on delete set null,

  -- Snapshot fields captured directly from the public form
  -- (kept even if customer record later changes)
  full_name text not null,
  phone text not null,
  email text,
  preferred_contact contact_method not null default 'phone',

  event_type text not null,
  event_date date not null,
  event_time time,
  venue text,
  venue_lat double precision,
  venue_lng double precision,
  guest_count integer,
  budget numeric(12,2),
  theme text,
  color_preferences text,
  custom_notes text,

  status booking_status not null default 'new',
  priority booking_priority not null default 'medium',
  payment_status payment_status not null default 'unpaid',
  quotation_status quotation_status,
  invoice_status invoice_status,

  assigned_staff_id uuid references public.users(id) on delete set null,
  is_favorite boolean not null default false,
  labels text[] default '{}',
  color_tag text,

  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_bookings_updated_at before update on public.bookings
  for each row execute function set_updated_at();
create index idx_bookings_status on public.bookings(status);
create index idx_bookings_event_date on public.bookings(event_date);
create index idx_bookings_customer on public.bookings(customer_id);
create index idx_bookings_created_at on public.bookings(created_at desc);

-- =====================================================================
-- BOOKING SERVICES (many-to-many: services selected per booking)
-- =====================================================================

create table public.booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_name text not null,
  -- e.g. 'decoration' | 'photography' | 'videography' | 'dj' | 'catering'
  -- | 'lighting' | 'stage' | 'makeup' | 'floral_decoration' | custom
  notes text,
  estimated_price numeric(12,2),
  created_at timestamptz not null default now()
);
create index idx_booking_services_booking on public.booking_services(booking_id);

-- =====================================================================
-- ACTIVITY LOGS (timeline for bookings/customers)
-- =====================================================================

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index idx_activity_logs_booking on public.activity_logs(booking_id);
create index idx_activity_logs_customer on public.activity_logs(customer_id);

-- =====================================================================
-- CUSTOMER NOTES (internal staff notes)
-- =====================================================================

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  note text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_customer_notes_updated_at before update on public.customer_notes
  for each row execute function set_updated_at();

-- =====================================================================
-- QUOTATIONS
-- =====================================================================

create sequence if not exists quotation_id_seq start 1001;

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique default ('QT-' || nextval('quotation_id_seq')::text),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  version integer not null default 1,
  status quotation_status not null default 'draft',
  items jsonb not null default '[]', -- [{name, description, qty, unit_price, total}]
  subtotal numeric(12,2) not null default 0,
  discount_type text default 'fixed', -- 'fixed' | 'percent'
  discount_value numeric(12,2) default 0,
  tax_percent numeric(5,2) default 0,
  total numeric(12,2) not null default 0,
  notes text,
  valid_until date,
  approved_at timestamptz,
  approved_by_signature text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_quotations_updated_at before update on public.quotations
  for each row execute function set_updated_at();
create index idx_quotations_booking on public.quotations(booking_id);

-- =====================================================================
-- INVOICES
-- =====================================================================

create sequence if not exists invoice_id_seq start 1001;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default ('INV-' || nextval('invoice_id_seq')::text),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  status invoice_status not null default 'draft',
  items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  discount_value numeric(12,2) default 0,
  tax_percent numeric(5,2) default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  amount_due numeric(12,2) generated always as (total - amount_paid) stored,
  due_date date,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_invoices_updated_at before update on public.invoices
  for each row execute function set_updated_at();
create index idx_invoices_booking on public.invoices(booking_id);

-- =====================================================================
-- PAYMENTS
-- =====================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric(12,2) not null,
  method payment_method not null default 'cash',
  is_advance boolean not null default false,
  reference_number text,
  receipt_url text,
  paid_at timestamptz not null default now(),
  received_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_payments_booking on public.payments(booking_id);
create index idx_payments_invoice on public.payments(invoice_id);

-- =====================================================================
-- STAFF EXTRAS: TASKS, ATTENDANCE, AVAILABILITY
-- =====================================================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'pending',
  due_date date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function set_updated_at();

create table public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  is_available boolean not null default true,
  note text,
  unique(user_id, date)
);

-- =====================================================================
-- VENDORS
-- =====================================================================

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- catering, photography, makeup, dj, hotels, flower_suppliers
  contact_person text,
  phone text,
  email text,
  address text,
  rating numeric(2,1) default 0,
  contract_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_vendors_updated_at before update on public.vendors
  for each row execute function set_updated_at();

create table public.vendor_payments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now(),
  notes text
);

-- =====================================================================
-- INVENTORY
-- =====================================================================

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- flowers, furniture, lighting, stage, vehicles, decorations
  sku text unique,
  barcode text,
  qr_code text,
  quantity integer not null default 0,
  unit text default 'pcs',
  supplier_id uuid references public.vendors(id) on delete set null,
  purchase_price numeric(12,2),
  is_available boolean not null default true,
  location text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_inventory_updated_at before update on public.inventory
  for each row execute function set_updated_at();

create table public.inventory_bookings (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  quantity_used integer not null default 1,
  reserved_from date,
  reserved_to date
);

-- =====================================================================
-- FILES / ATTACHMENTS / GALLERY
-- =====================================================================

create table public.files (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  category text,
  event_type text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- REVIEWS
-- =====================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade, -- null = broadcast to all admins
  type notification_type not null,
  title text not null,
  message text,
  link text,
  is_read boolean not null default false,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id, is_read);

-- =====================================================================
-- SETTINGS (singleton-ish key/value store for company config)
-- =====================================================================

create table public.settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on public.settings
  for each row execute function set_updated_at();

-- =====================================================================
-- AUTO-CREATE CUSTOMER + ACTIVITY LOG ON NEW BOOKING
-- =====================================================================

create or replace function handle_new_booking()
returns trigger as $$
declare
  existing_customer_id uuid;
begin
  -- find existing customer by phone
  select id into existing_customer_id from public.customers
    where phone = new.phone limit 1;

  if existing_customer_id is null then
    insert into public.customers (full_name, phone, email, preferred_contact)
    values (new.full_name, new.phone, new.email, new.preferred_contact)
    returning id into existing_customer_id;
  end if;

  new.customer_id := existing_customer_id;

  return new;
end;
$$ language plpgsql;

create trigger trg_handle_new_booking
  before insert on public.bookings
  for each row execute function handle_new_booking();

create or replace function handle_booking_activity_log()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity_logs (booking_id, customer_id, action, description)
    values (new.id, new.customer_id, 'booking_created',
      'New booking ' || new.booking_code || ' submitted for ' || new.event_type);
  elsif (tg_op = 'UPDATE' and old.status is distinct from new.status) then
    insert into public.activity_logs (booking_id, customer_id, action, description)
    values (new.id, new.customer_id, 'status_changed',
      'Status changed from ' || old.status || ' to ' || new.status);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_booking_activity_log
  after insert or update on public.bookings
  for each row execute function handle_booking_activity_log();

-- Auto-notify admins on new booking
create or replace function handle_new_booking_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, message, link)
  values (
    null,
    'new_booking',
    'New Booking Received',
    new.full_name || ' booked a ' || new.event_type || ' for ' || new.event_date,
    '/admin/bookings/' || new.id
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_new_booking_notification
  after insert on public.bookings
  for each row execute function handle_new_booking_notification();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;
alter table public.activity_logs enable row level security;
alter table public.customer_notes enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.tasks enable row level security;
alter table public.staff_availability enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_payments enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_bookings enable row level security;
alter table public.files enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

-- Helper: is the current user an authenticated staff member?
create or replace function is_staff()
returns boolean as $$
  select exists (
    select 1 from public.users where id = auth.uid() and is_active = true
  );
$$ language sql security definer stable;

-- Helper: is the current user an admin/manager?
create or replace function is_admin_or_manager()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','manager') and is_active = true
  );
$$ language sql security definer stable;

-- ---- PUBLIC BOOKING FORM (anon) ----
-- Anonymous visitors may INSERT a booking + its services, nothing else.
create policy "public_can_insert_booking" on public.bookings
  for insert to anon with check (true);

create policy "public_can_insert_booking_services" on public.booking_services
  for insert to anon with check (
    exists (select 1 from public.bookings b where b.id = booking_id)
  );

-- Staff can do everything on bookings / services once authenticated
create policy "staff_full_access_bookings" on public.bookings
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_booking_services" on public.booking_services
  for all to authenticated using (is_staff()) with check (is_staff());

-- ---- Generic staff-only policies for all remaining tables ----
create policy "staff_full_access_users" on public.users
  for select to authenticated using (is_staff());
create policy "self_or_admin_update_users" on public.users
  for update to authenticated using (id = auth.uid() or is_admin_or_manager());
create policy "admin_manage_users" on public.users
  for insert to authenticated with check (is_admin_or_manager());
create policy "admin_delete_users" on public.users
  for delete to authenticated using (is_admin_or_manager());

create policy "staff_full_access_customers" on public.customers
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_activity_logs" on public.activity_logs
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_customer_notes" on public.customer_notes
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_quotations" on public.quotations
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_invoices" on public.invoices
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_payments" on public.payments
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_tasks" on public.tasks
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_staff_availability" on public.staff_availability
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_vendors" on public.vendors
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_vendor_payments" on public.vendor_payments
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_inventory" on public.inventory
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_inventory_bookings" on public.inventory_bookings
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "staff_full_access_files" on public.files
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "public_can_view_gallery" on public.gallery
  for select to anon using (true);
create policy "staff_full_access_gallery" on public.gallery
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "public_can_insert_review" on public.reviews
  for insert to anon with check (true);
create policy "staff_full_access_reviews" on public.reviews
  for all to authenticated using (is_staff()) with check (is_staff());

create policy "user_view_own_notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid() or user_id is null);
create policy "user_update_own_notifications" on public.notifications
  for update to authenticated using (user_id = auth.uid() or user_id is null);
create policy "staff_insert_notifications" on public.notifications
  for insert to authenticated with check (is_staff());

create policy "public_can_view_settings" on public.settings
  for select to anon using (true);
create policy "admin_manage_settings" on public.settings
  for all to authenticated using (is_admin_or_manager()) with check (is_admin_or_manager());

-- =====================================================================
-- REALTIME
-- =====================================================================

alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.booking_services;
alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.tasks;
