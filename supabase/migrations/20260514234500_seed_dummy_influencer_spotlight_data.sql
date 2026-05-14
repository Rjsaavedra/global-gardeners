with seeded_profiles as (
  insert into public.influencer_profiles (
    slug,
    name,
    short_description,
    description,
    avatar_url,
    influencer_of_the_month,
    featured_month,
    votes_count,
    is_published
  )
  values
    (
      'ava-greenleaf',
      'Ava Greenleaf',
      'Indoor jungle stylist and Monstera lover.',
      'Ava shares practical ways to style plant-filled homes, from shelf layering to easy propagation routines for beginners.',
      '/images/figma/placeholder-expired.png',
      true,
      date '2026-05-01',
      482,
      true
    ),
    (
      'milo-fernandez',
      'Milo Fernandez',
      'Balcony gardener focused on small-space harvests.',
      'Milo teaches apartment gardeners how to grow herbs, tomatoes, and pollinator-friendly flowers in tiny urban spaces.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      356,
      true
    ),
    (
      'nora-bloom',
      'Nora Bloom',
      'Propagation coach for beginner plant parents.',
      'Nora simplifies node cuts, water propagation, and transplant timing with clear, repeatable steps anyone can follow.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      298,
      true
    ),
    (
      'kai-rivers',
      'Kai Rivers',
      'Rare aroid collector and care explainer.',
      'Kai breaks down humidity, substrate mixes, and lighting setups for finicky tropicals without overwhelming new growers.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      267,
      true
    ),
    (
      'lena-moss',
      'Lena Moss',
      'Plant wellness educator and pest detective.',
      'Lena publishes clear diagnostics for yellow leaves, fungus gnats, and root rot with prevention-first care routines.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      415,
      true
    ),
    (
      'theo-petal',
      'Theo Petal',
      'Terrarium builder and moss wall artist.',
      'Theo creates low-maintenance closed terrariums and decorative green installations suited for modern interiors.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      189,
      true
    ),
    (
      'isla-root',
      'Isla Root',
      'Native plant advocate and pollinator mentor.',
      'Isla highlights region-friendly planting plans that support bees, butterflies, and birds throughout the year.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      322,
      true
    ),
    (
      'reid-verdant',
      'Reid Verdant',
      'Soil mix experimenter and growth tracker.',
      'Reid compares substrate recipes, watering cadence, and nutrition timing through data-backed growth journals.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      241,
      true
    ),
    (
      'sophia-canopy',
      'Sophia Canopy',
      'Design-forward creator for shelfie setups.',
      'Sophia blends decor and plant care, teaching followers how to keep visually stunning corners healthy long term.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      274,
      true
    ),
    (
      'owen-sprig',
      'Owen Sprig',
      'Weekend gardener sharing realistic routines.',
      'Owen focuses on practical, time-efficient care checklists for people balancing plants with busy schedules.',
      '/images/figma/placeholder-expired.png',
      false,
      null,
      206,
      true
    )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    avatar_url = excluded.avatar_url,
    influencer_of_the_month = excluded.influencer_of_the_month,
    featured_month = excluded.featured_month,
    votes_count = excluded.votes_count,
    is_published = excluded.is_published,
    updated_at = now()
  returning id, slug
),
all_profiles as (
  select id, slug from seeded_profiles
  union
  select id, slug
  from public.influencer_profiles
  where slug in (
    'ava-greenleaf','milo-fernandez','nora-bloom','kai-rivers','lena-moss',
    'theo-petal','isla-root','reid-verdant','sophia-canopy','owen-sprig'
  )
)
insert into public.influencer_videos (
  influencer_profile_id,
  title,
  video_url,
  thumbnail_url,
  duration_seconds,
  views_count,
  published_at,
  sort_order,
  is_published
)
select
  p.id,
  v.title,
  v.video_url,
  v.thumbnail_url,
  v.duration_seconds,
  v.views_count,
  v.published_at,
  v.sort_order,
  true
from all_profiles p
join lateral (
  values
    (
      'Plant Care Routine for Busy People',
      'https://www.youtube.com/watch?v=QH2-TGUlwu4',
      'https://img.youtube.com/vi/QH2-TGUlwu4/hqdefault.jpg',
      720,
      3500,
      timestamptz '2026-05-10 10:00:00+00',
      0
    ),
    (
      'Repotting Tips You Actually Need',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      845,
      5100,
      timestamptz '2026-05-12 14:00:00+00',
      1
    )
) as v(title, video_url, thumbnail_url, duration_seconds, views_count, published_at, sort_order) on true
where not exists (
  select 1
  from public.influencer_videos iv
  where iv.influencer_profile_id = p.id
    and iv.video_url = v.video_url
);

with profile_rows as (
  select id, slug
  from public.influencer_profiles
  where slug in (
    'ava-greenleaf','milo-fernandez','nora-bloom','kai-rivers','lena-moss',
    'theo-petal','isla-root','reid-verdant','sophia-canopy','owen-sprig'
  )
)
insert into public.past_spotlight_creators (
  influencer_profile_id,
  spotlight_month,
  sort_order,
  is_published
)
select
  p.id,
  t.spotlight_month,
  t.sort_order,
  true
from profile_rows p
join (
  values
    ('lena-moss', date '2025-12-01', 0),
    ('milo-fernandez', date '2026-01-01', 1),
    ('nora-bloom', date '2026-02-01', 2),
    ('isla-root', date '2026-03-01', 3)
) as t(slug, spotlight_month, sort_order)
  on p.slug = t.slug
on conflict (influencer_profile_id, spotlight_month) do update set
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

with profile_rows as (
  select id, slug
  from public.influencer_profiles
  where slug in (
    'ava-greenleaf','milo-fernandez','nora-bloom','kai-rivers','lena-moss',
    'theo-petal','isla-root','reid-verdant','sophia-canopy','owen-sprig'
  )
)
insert into public.influencer_next_month_nominees (
  influencer_profile_id,
  nomination_month,
  votes_count,
  sort_order,
  is_published
)
select
  p.id,
  date '2026-06-01',
  t.votes_count,
  t.sort_order,
  true
from profile_rows p
join (
  values
    ('milo-fernandez', 129, 0),
    ('nora-bloom', 117, 1),
    ('kai-rivers', 103, 2),
    ('sophia-canopy', 98, 3),
    ('owen-sprig', 84, 4)
) as t(slug, votes_count, sort_order)
  on p.slug = t.slug
on conflict (influencer_profile_id, nomination_month) do update set
  votes_count = excluded.votes_count,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();

