import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("influencer_profiles")
    .select("id, slug, name, short_description, description, avatar_url, featured_month")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { data: videos, error: videosError } = await supabase
    .from("influencer_videos")
    .select("id, title, video_url, thumbnail_url, duration_seconds, views_count, published_at")
    .eq("influencer_profile_id", profile.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (videosError) {
    return NextResponse.json({ error: videosError.message }, { status: 400 });
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      shortDescription: profile.short_description,
      description: profile.description,
      avatarUrl: profile.avatar_url,
      featuredMonth: profile.featured_month,
    },
    videos:
      videos?.map((video) => ({
        id: video.id,
        title: video.title,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        durationSeconds: video.duration_seconds,
        viewsCount: video.views_count,
        publishedAt: video.published_at,
      })) ?? [],
  });
}

