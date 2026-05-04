update public.profiles
set user_settings = coalesce(user_settings, '{}'::jsonb) || jsonb_build_object(
  'notifications',
  coalesce(user_settings->'notifications', '{}'::jsonb) || jsonb_build_object(
    'watering', coalesce((user_settings->'notifications'->>'watering')::boolean, true),
    'fertilizing', coalesce((user_settings->'notifications'->>'fertilizing')::boolean, false),
    'repotting', coalesce((user_settings->'notifications'->>'repotting')::boolean, false),
    'care-suggestions', coalesce((user_settings->'notifications'->>'care-suggestions')::boolean, true),
    'care-follow-ups', coalesce((user_settings->'notifications'->>'care-follow-ups')::boolean, true),
    'new-followers', coalesce((user_settings->'notifications'->>'new-followers')::boolean, true),
    'likes', coalesce((user_settings->'notifications'->>'likes')::boolean, true),
    'comments', coalesce((user_settings->'notifications'->>'comments')::boolean, true),
    'push', coalesce((user_settings->'notifications'->>'push')::boolean, true),
    'email', coalesce((user_settings->'notifications'->>'email')::boolean, false)
  )
)
where user_settings is null
   or jsonb_typeof(user_settings) = 'object';
