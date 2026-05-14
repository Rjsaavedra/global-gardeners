drop policy if exists "influencer_profiles_select_published_authenticated" on public.influencer_profiles;
drop policy if exists "influencer_profiles_select_published_public" on public.influencer_profiles;
create policy "influencer_profiles_select_published_public"
on public.influencer_profiles
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "influencer_profiles_insert_authenticated" on public.influencer_profiles;
create policy "influencer_profiles_insert_authenticated"
on public.influencer_profiles
for insert
to authenticated
with check (true);

drop policy if exists "influencer_profiles_update_authenticated" on public.influencer_profiles;
create policy "influencer_profiles_update_authenticated"
on public.influencer_profiles
for update
to authenticated
using (true)
with check (true);

drop policy if exists "influencer_profiles_delete_authenticated" on public.influencer_profiles;
create policy "influencer_profiles_delete_authenticated"
on public.influencer_profiles
for delete
to authenticated
using (true);

drop policy if exists "influencer_videos_select_published_authenticated" on public.influencer_videos;
drop policy if exists "influencer_videos_select_published_public" on public.influencer_videos;
create policy "influencer_videos_select_published_public"
on public.influencer_videos
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "influencer_videos_insert_authenticated" on public.influencer_videos;
create policy "influencer_videos_insert_authenticated"
on public.influencer_videos
for insert
to authenticated
with check (true);

drop policy if exists "influencer_videos_update_authenticated" on public.influencer_videos;
create policy "influencer_videos_update_authenticated"
on public.influencer_videos
for update
to authenticated
using (true)
with check (true);

drop policy if exists "influencer_videos_delete_authenticated" on public.influencer_videos;
create policy "influencer_videos_delete_authenticated"
on public.influencer_videos
for delete
to authenticated
using (true);

