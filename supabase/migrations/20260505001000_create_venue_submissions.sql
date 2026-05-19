-- User-submitted venues waiting for admin moderation.
-- Run after 20260505000000_create_venues.sql.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.venue_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  subcategory text not null default '',
  address text not null default '',
  icon text not null default '📍',
  rating numeric(2,1) not null default 0,
  instagram text,
  lat double precision not null,
  lng double precision not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_venue_id integer references public.venues(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.venue_submissions enable row level security;

drop trigger if exists venue_submissions_set_updated_at on public.venue_submissions;
create trigger venue_submissions_set_updated_at
before update on public.venue_submissions
for each row execute function public.set_updated_at();

drop policy if exists "users can create own venue submissions" on public.venue_submissions;
create policy "users can create own venue submissions"
on public.venue_submissions for insert
to authenticated
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "users can read own venue submissions" on public.venue_submissions;
create policy "users can read own venue submissions"
on public.venue_submissions for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins can update venue submissions" on public.venue_submissions;
create policy "admins can update venue submissions"
on public.venue_submissions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete venue submissions" on public.venue_submissions;
create policy "admins can delete venue submissions"
on public.venue_submissions for delete
to authenticated
using (public.is_admin());

grant select, insert on table public.venue_submissions to authenticated;
grant update, delete on table public.venue_submissions to authenticated;
