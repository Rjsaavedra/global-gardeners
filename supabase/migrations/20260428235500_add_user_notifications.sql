create table if not exists public.user_notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  post_id bigint references public.posts(id) on delete set null,
  comment_id bigint references public.post_comments(id) on delete set null,
  type text not null check (type in ('follow', 'post_like', 'post_comment')),
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists user_notifications_user_id_created_at_idx
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.user_notifications;
create policy "Users can read own notifications"
on public.user_notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert notifications for themselves" on public.user_notifications;
create policy "Users can insert notifications for themselves"
on public.user_notifications
for insert
to authenticated
with check (auth.uid() = actor_user_id or actor_user_id is null);
