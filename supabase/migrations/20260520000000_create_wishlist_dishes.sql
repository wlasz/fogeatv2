-- Dish wishlist entries are stored separately from venue wishlist entries.

create extension if not exists pgcrypto;

create table if not exists public.wishlist_dishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id integer not null,
  dish_id integer not null,
  venue_name text not null,
  dish_name text not null,
  dish_icon text not null default '🍽️',
  dish_tag text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, venue_id, dish_id)
);

alter table public.wishlist_dishes enable row level security;

drop policy if exists "users can read own dish wishlist" on public.wishlist_dishes;
create policy "users can read own dish wishlist"
on public.wishlist_dishes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own dish wishlist" on public.wishlist_dishes;
create policy "users can insert own dish wishlist"
on public.wishlist_dishes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can delete own dish wishlist" on public.wishlist_dishes;
create policy "users can delete own dish wishlist"
on public.wishlist_dishes for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, delete on table public.wishlist_dishes to authenticated;
