create table if not exists public.user_follows (
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  followed_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint user_follows_pkey primary key (follower_user_id, followed_user_id),
  constraint user_follows_no_self_follow check (follower_user_id <> followed_user_id)
);

alter table public.user_follows enable row level security;

drop policy if exists "User follows are readable by authenticated users" on public.user_follows;
create policy "User follows are readable by authenticated users"
on public.user_follows
for select
to authenticated
using (true);

drop policy if exists "Users can insert own follows" on public.user_follows;
create policy "Users can insert own follows"
on public.user_follows
for insert
to authenticated
with check (auth.uid() = follower_user_id);

drop policy if exists "Users can delete own follows" on public.user_follows;
create policy "Users can delete own follows"
on public.user_follows
for delete
to authenticated
using (auth.uid() = follower_user_id);
