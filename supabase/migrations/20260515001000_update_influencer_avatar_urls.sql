update public.influencer_profiles
set avatar_url = case slug
  when 'ava-greenleaf' then 'https://i.pravatar.cc/160?img=11'
  when 'milo-fernandez' then 'https://i.pravatar.cc/160?img=12'
  when 'nora-bloom' then 'https://i.pravatar.cc/160?img=13'
  when 'kai-rivers' then 'https://i.pravatar.cc/160?img=14'
  when 'lena-moss' then 'https://i.pravatar.cc/160?img=15'
  when 'theo-petal' then 'https://i.pravatar.cc/160?img=16'
  when 'isla-root' then 'https://i.pravatar.cc/160?img=17'
  when 'reid-verdant' then 'https://i.pravatar.cc/160?img=18'
  when 'sophia-canopy' then 'https://i.pravatar.cc/160?img=19'
  when 'owen-sprig' then 'https://i.pravatar.cc/160?img=20'
  else avatar_url
end
where slug in (
  'ava-greenleaf',
  'milo-fernandez',
  'nora-bloom',
  'kai-rivers',
  'lena-moss',
  'theo-petal',
  'isla-root',
  'reid-verdant',
  'sophia-canopy',
  'owen-sprig'
);

