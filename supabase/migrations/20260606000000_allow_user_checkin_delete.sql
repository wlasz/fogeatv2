drop policy if exists "users can delete own checkins" on public.checkins;

create policy "users can delete own checkins"
on public.checkins for delete
to authenticated
using (auth.uid() = user_id);

grant delete on table public.checkins to authenticated;
