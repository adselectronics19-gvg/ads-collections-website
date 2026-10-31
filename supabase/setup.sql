-- ADS COLLECTIONS: secure catalogue setup
-- Run this in Supabase Dashboard > SQL Editor.
-- Then create ONE owner account in Authentication > Users (Add user).
-- Do not put your service_role/secret key in the website.

create extension if not exists pgcrypto;

create table if not exists public.saree_products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  price numeric(10,2) not null check (price > 0),
  photo1 text not null,
  photo2 text not null,
  created_at timestamptz not null default now()
);

create index if not exists saree_products_created_at_idx
  on public.saree_products (created_at desc);

alter table public.saree_products enable row level security;

-- Anyone may view the public catalogue.
drop policy if exists "Public can view sarees" on public.saree_products;
create policy "Public can view sarees"
  on public.saree_products for select
  to anon, authenticated
  using (true);

-- Only the signed-in owner UID configured below may modify products.
-- IMPORTANT: Replace OWNER_AUTH_USER_UUID with the UUID shown for the owner
-- in Authentication > Users. Use the UUID without angle brackets.
-- Example: (auth.uid() = '12345678-1234-1234-1234-123456789abc'::uuid)
drop policy if exists "Owner can insert sarees" on public.saree_products;
create policy "Owner can insert sarees"
  on public.saree_products for insert to authenticated
  with check (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

drop policy if exists "Owner can update sarees" on public.saree_products;
create policy "Owner can update sarees"
  on public.saree_products for update to authenticated
  using (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid)
  with check (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

drop policy if exists "Owner can delete sarees" on public.saree_products;
create policy "Owner can delete sarees"
  on public.saree_products for delete to authenticated
  using (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

-- Image storage bucket. Public reads are intentional so product photos load
-- on the customer catalogue; uploads/deletes are owner-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('saree-photos', 'saree-photos', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "Public can view saree photos" on storage.objects;
create policy "Public can view saree photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'saree-photos');

drop policy if exists "Owner can upload saree photos" on storage.objects;
create policy "Owner can upload saree photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'saree-photos' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

drop policy if exists "Owner can update saree photos" on storage.objects;
create policy "Owner can update saree photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'saree-photos' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid)
  with check (bucket_id = 'saree-photos' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

drop policy if exists "Owner can delete saree photos" on storage.objects;
create policy "Owner can delete saree photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'saree-photos' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

-- Optional: disable public sign-ups in Supabase Authentication settings.
-- Create the owner manually in Dashboard > Authentication > Users.
