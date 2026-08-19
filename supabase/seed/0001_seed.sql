-- Default company settings used by the booking site + PDF branding
insert into public.settings (key, value) values
  ('company_profile', '{
    "name": "Floral Roots",
    "tagline": "Premium Events & Decor",
    "phone": "",
    "email": "",
    "address": "",
    "logo_url": "",
    "currency": "NPR",
    "tax_percent": 13
  }'),
  ('event_types', '["Wedding","Engagement","Birthday","Corporate Event","Anniversary","Baby Shower","Reception","Religious Ceremony","Other"]'),
  ('service_catalog', '[
    {"key":"decoration","label":"Decoration"},
    {"key":"photography","label":"Photography"},
    {"key":"videography","label":"Videography"},
    {"key":"dj","label":"DJ"},
    {"key":"catering","label":"Catering"},
    {"key":"lighting","label":"Lighting"},
    {"key":"stage","label":"Stage"},
    {"key":"makeup","label":"Makeup"},
    {"key":"floral_decoration","label":"Floral Decoration"}
  ]')
on conflict (key) do nothing;

-- NOTE ON CREATING YOUR FIRST ADMIN USER:
-- 1. Sign up a user via Supabase Auth (Dashboard > Authentication > Add User,
--    or through the app's /login "create account" flow once wired to a real signup action).
-- 2. Then run, substituting the real auth user id + email:
--
-- insert into public.users (id, full_name, email, role)
-- values ('<auth-user-uuid>', 'Admin Name', 'admin@example.com', 'admin');
