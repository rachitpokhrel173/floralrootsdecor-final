-- =====================================================================
-- Storage bucket for company branding assets (logo, etc.)
-- Public read (so it can render in quotation/invoice PDFs and the public
-- site), write restricted to authenticated staff.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

create policy "public_read_company_assets"
  on storage.objects for select
  to public
  using (bucket_id = 'company-assets');

create policy "staff_upload_company_assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'company-assets' and is_staff());

create policy "staff_update_company_assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'company-assets' and is_staff());

create policy "staff_delete_company_assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'company-assets' and is_staff());
