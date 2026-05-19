-- Limits for user-created venue flows.
-- Moderation submissions: 3 per Moscow day.
-- Personal map venues: 10 active custom venues per user.

create table if not exists public.venue_submission_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  submitted_count integer not null default 0 check (submitted_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.venue_submission_daily_usage enable row level security;

drop policy if exists "users can read own venue submission quota" on public.venue_submission_daily_usage;
create policy "users can read own venue submission quota"
on public.venue_submission_daily_usage for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

grant select on table public.venue_submission_daily_usage to authenticated;

insert into public.venue_submission_daily_usage (user_id, usage_date, submitted_count, updated_at)
select
  user_id,
  (created_at at time zone 'Europe/Moscow')::date as usage_date,
  count(*)::integer as submitted_count,
  now() as updated_at
from public.venue_submissions
group by user_id, (created_at at time zone 'Europe/Moscow')::date
on conflict (user_id, usage_date) do update
set
  submitted_count = greatest(
    public.venue_submission_daily_usage.submitted_count,
    excluded.submitted_count
  ),
  updated_at = now();

create or replace function public.enforce_venue_submission_daily_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_day date := (now() at time zone 'Europe/Moscow')::date;
  current_count integer;
begin
  insert into public.venue_submission_daily_usage (user_id, usage_date, submitted_count, updated_at)
  values (new.user_id, usage_day, 1, now())
  on conflict (user_id, usage_date) do update
  set
    submitted_count = public.venue_submission_daily_usage.submitted_count + 1,
    updated_at = now()
  returning submitted_count into current_count;

  if current_count > 3 then
    raise exception 'venue_submission_daily_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists venue_submissions_daily_limit on public.venue_submissions;
create trigger venue_submissions_daily_limit
before insert on public.venue_submissions
for each row execute function public.enforce_venue_submission_daily_limit();

create or replace function public.enforce_custom_venue_total_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count integer;
begin
  if coalesce(new.deleted, false) then
    return new;
  end if;

  select count(*) into active_count
  from public.custom_venues
  where user_id = new.user_id
    and coalesce(deleted, false) = false;

  if active_count >= 10 then
    raise exception 'custom_venue_total_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.custom_venues') is not null then
    execute 'drop trigger if exists custom_venues_total_limit on public.custom_venues';
    execute 'create trigger custom_venues_total_limit before insert on public.custom_venues for each row execute function public.enforce_custom_venue_total_limit()';
  end if;
end $$;
