-- ============================================================
-- Duet — Supabase schema
-- Run in Supabase SQL Editor (or `supabase db push`).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- couples ----------
do $$ begin
  create type public.couple_status as enum ('pending', 'active');
exception when duplicate_object then null; end $$;

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  partner_a uuid not null references auth.users(id) on delete cascade,
  partner_b uuid references auth.users(id) on delete set null,
  invite_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  status public.couple_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint partners_distinct check (partner_a is distinct from partner_b)
);

create index if not exists couples_partner_a_idx on public.couples(partner_a);
create index if not exists couples_partner_b_idx on public.couples(partner_b);

-- ---------- garments ----------
do $$ begin
  create type public.garment_type as enum ('top', 'bottom');
exception when duplicate_object then null; end $$;

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type public.garment_type not null,
  image_path text not null,
  image_url text not null,
  description text,
  color_name text,
  color_hex text,
  color_family text,
  seasons text[] default '{}',
  formality text,
  style_tags text[] default '{}',
  complements text[] default '{}',
  analyzed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists garments_owner_idx on public.garments(owner_id);
create index if not exists garments_type_idx on public.garments(type);

-- ---------- outfits ----------
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  partner_a_top uuid references public.garments(id) on delete set null,
  partner_a_bottom uuid references public.garments(id) on delete set null,
  partner_b_top uuid references public.garments(id) on delete set null,
  partner_b_bottom uuid references public.garments(id) on delete set null,
  locked_color_hex text,
  locked_color_name text,
  rationale text,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  planned_for date default current_date,
  created_at timestamptz not null default now()
);

create index if not exists outfits_couple_idx on public.outfits(couple_id);
create index if not exists outfits_confirmed_idx on public.outfits(couple_id, confirmed, planned_for);

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;

-- profiles: read own + partner; write own
drop policy if exists "profiles read self/partner" on public.profiles;
create policy "profiles read self/partner" on public.profiles for select
using (
  id = auth.uid()
  or exists (
    select 1 from public.couples c
    where (c.partner_a = auth.uid() and c.partner_b = profiles.id)
       or (c.partner_b = auth.uid() and c.partner_a = profiles.id)
  )
);

drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles for update
using (id = auth.uid());

-- couples: members can read; creator can insert; partner_b can join via service-role function
drop policy if exists "couples read members" on public.couples;
create policy "couples read members" on public.couples for select
using (auth.uid() in (partner_a, partner_b));

drop policy if exists "couples insert as partner_a" on public.couples;
create policy "couples insert as partner_a" on public.couples for insert
with check (partner_a = auth.uid());

drop policy if exists "couples update members" on public.couples;
create policy "couples update members" on public.couples for update
using (auth.uid() in (partner_a, partner_b));

-- garments: owner full access; partner read only when active couple
drop policy if exists "garments owner all" on public.garments;
create policy "garments owner all" on public.garments for all
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "garments partner read" on public.garments;
create policy "garments partner read" on public.garments for select
using (
  exists (
    select 1 from public.couples c
    where c.status = 'active'
      and (
        (c.partner_a = auth.uid() and c.partner_b = garments.owner_id)
        or (c.partner_b = auth.uid() and c.partner_a = garments.owner_id)
      )
  )
);

-- outfits: members read/write their couple's outfits
drop policy if exists "outfits members read" on public.outfits;
create policy "outfits members read" on public.outfits for select
using (
  exists (
    select 1 from public.couples c
    where c.id = outfits.couple_id and auth.uid() in (c.partner_a, c.partner_b)
  )
);

drop policy if exists "outfits members write" on public.outfits;
create policy "outfits members write" on public.outfits for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.couples c
    where c.id = outfits.couple_id and auth.uid() in (c.partner_a, c.partner_b)
  )
);

drop policy if exists "outfits members update" on public.outfits;
create policy "outfits members update" on public.outfits for update
using (
  exists (
    select 1 from public.couples c
    where c.id = outfits.couple_id and auth.uid() in (c.partner_a, c.partner_b)
  )
);

-- ============================================================
-- Storage bucket (run once)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('garments', 'garments', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "garments storage owner write" on storage.objects;
create policy "garments storage owner write" on storage.objects for insert
with check (
  bucket_id = 'garments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "garments storage owner update" on storage.objects;
create policy "garments storage owner update" on storage.objects for update
using (
  bucket_id = 'garments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "garments storage owner delete" on storage.objects;
create policy "garments storage owner delete" on storage.objects for delete
using (
  bucket_id = 'garments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "garments storage public read" on storage.objects;
create policy "garments storage public read" on storage.objects for select
using (bucket_id = 'garments');

-- ============================================================
-- Helper RPC: join a couple via invite token
-- (runs as SECURITY DEFINER so partner_b can attach atomically)
-- ============================================================
create or replace function public.join_couple(p_token text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.couples;
begin
  select * into c from public.couples where invite_token = p_token;
  if c.id is null then
    raise exception 'invalid invite token';
  end if;
  if c.partner_a = auth.uid() then
    return c;
  end if;
  if c.partner_b is not null and c.partner_b <> auth.uid() then
    raise exception 'this couple is already paired';
  end if;
  update public.couples
    set partner_b = auth.uid(), status = 'active'
    where id = c.id
    returning * into c;
  return c;
end $$;

grant execute on function public.join_couple(text) to authenticated;

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
