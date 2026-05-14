update public.influencer_videos
set thumbnail_url = case title
  when 'Plant Care Routine for Busy People' then 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80'
  when 'Repotting Tips You Actually Need' then 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80'
  else thumbnail_url
end
where title in (
  'Plant Care Routine for Busy People',
  'Repotting Tips You Actually Need'
);

