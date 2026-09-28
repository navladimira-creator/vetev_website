-- =====================================================================
-- Kavárna Větev – databáze rezervací (Supabase)
-- Celý tento soubor zkopírujte do Supabase → SQL Editor → New query
-- a klikněte na Run. Spustit stačí jednou.
-- =====================================================================

-- 1) Tabulka rezervací (stoly i pečivo)
create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('table', 'pastry')),
  date        date not null,
  time        text not null check (time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  name        text not null check (char_length(name) between 3 and 120),
  phone       text not null check (char_length(phone) between 9 and 30),
  email       text not null check (char_length(email) between 5 and 160),
  people      int  check (people between 1 and 6),
  items       jsonb,
  note        text check (char_length(note) <= 500),
  done        boolean not null default false,
  constraint table_has_people check (kind <> 'table'  or people is not null),
  constraint pastry_has_items check (kind <> 'pastry' or (items is not null and jsonb_typeof(items) = 'object'))
);
create index if not exists reservations_date_idx on public.reservations (date);

-- 2) Seznam e-mailů personálu, který smí rezervace vidět a upravovat
create table if not exists public.staff (
  email text primary key
);
-- !!! Sem doplňte e-mail účtu, kterým se bude personál přihlašovat na iPadu:
insert into public.staff (email) values ('budnavetvi@gmail.com')
  on conflict do nothing;

-- 3) Bezpečnostní pravidla
alter table public.reservations enable row level security;
alter table public.staff        enable row level security;   -- nikdo zvenku ji nečte

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Host z webu smí rezervaci pouze VLOŽIT (nevidí žádné cizí rezervace)
drop policy if exists "hoste vkladaji" on public.reservations;
create policy "hoste vkladaji" on public.reservations
  for insert to anon, authenticated
  with check (done = false and date >= current_date and date <= current_date + 120);

-- Personál (přihlášený e-mail ze seznamu staff) čte, upravuje a maže
drop policy if exists "personal cte" on public.reservations;
create policy "personal cte" on public.reservations
  for select to authenticated using (public.is_staff());

drop policy if exists "personal upravuje" on public.reservations;
create policy "personal upravuje" on public.reservations
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "personal maze" on public.reservations;
create policy "personal maze" on public.reservations
  for delete to authenticated using (public.is_staff());

-- 4) Živé změny na iPadu (nové rezervace naskočí bez obnovení stránky)
do $$ begin
  alter publication supabase_realtime add table public.reservations;
exception when duplicate_object then null; end $$;
