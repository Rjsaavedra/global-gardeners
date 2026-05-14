-- Ensure only one published influencer can be marked as influencer_of_the_month per month.
create unique index if not exists influencer_profiles_unique_featured_month_idx
  on public.influencer_profiles (featured_month)
  where influencer_of_the_month = true and is_published = true and featured_month is not null;

-- Helper function for admins/tools to set the influencer of the month safely.
-- It clears existing monthly winner, then marks the target profile as winner for that month.
create or replace function public.set_influencer_of_the_month(
  p_influencer_profile_id bigint,
  p_featured_month date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_influencer_profile_id is null or p_featured_month is null then
    raise exception 'influencer_profile_id and featured_month are required';
  end if;

  -- Clear any current winner for the same month.
  update public.influencer_profiles
  set influencer_of_the_month = false,
      updated_at = now()
  where featured_month = p_featured_month
    and influencer_of_the_month = true;

  -- Set target winner for the month.
  update public.influencer_profiles
  set influencer_of_the_month = true,
      featured_month = p_featured_month,
      updated_at = now()
  where id = p_influencer_profile_id;

  if not found then
    raise exception 'Influencer profile % not found', p_influencer_profile_id;
  end if;
end;
$$;

grant execute on function public.set_influencer_of_the_month(bigint, date) to authenticated;

