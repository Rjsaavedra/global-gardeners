import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  const { data: featured, error: featuredError } = await supabase
    .from("influencer_profiles")
    .select("id, slug, name, short_description, description, avatar_url, featured_month, votes_count")
    .eq("is_published", true)
    .eq("influencer_of_the_month", true)
    .order("featured_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featuredError) {
    return NextResponse.json({ error: featuredError.message }, { status: 400 });
  }

  if (!featured) {
    return NextResponse.json({ featured: null, videos: [] });
  }

  const { data: videos, error: videosError } = await supabase
    .from("influencer_videos")
    .select("id, title, video_url, thumbnail_url, duration_seconds, views_count, published_at")
    .eq("is_published", true)
    .eq("influencer_profile_id", featured.id)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (videosError) {
    return NextResponse.json({ error: videosError.message }, { status: 400 });
  }

  const { data: activeNominationMonthRow } = await supabase
    .from("influencer_next_month_nominees")
    .select("nomination_month")
    .eq("is_published", true)
    .order("nomination_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nominees: Array<{
    id: number;
    nominationMonth: string;
    votesCount: number;
    sortOrder: number;
    influencer: { id: number; slug: string; name: string; shortDescription: string; avatarUrl: string | null };
  }> = [];

  const nominationMonth: string | null = activeNominationMonthRow?.nomination_month ?? null;

  if (nominationMonth) {
    const { data: nomineeRows } = await supabase
      .from("influencer_next_month_nominees")
      .select(
        "id, nomination_month, votes_count, sort_order, influencer_profile_id, influencer_profiles!inner(id, slug, name, short_description, avatar_url)"
      )
      .eq("is_published", true)
      .eq("nomination_month", nominationMonth)
      .order("sort_order", { ascending: true });

    nominees =
      nomineeRows?.map((row) => {
        const profile = Array.isArray(row.influencer_profiles) ? row.influencer_profiles[0] : row.influencer_profiles;
        return {
          id: row.id,
          nominationMonth: row.nomination_month,
          votesCount: row.votes_count,
          sortOrder: row.sort_order,
          influencer: {
            id: profile.id,
            slug: profile.slug,
            name: profile.name,
            shortDescription: profile.short_description,
            avatarUrl: profile.avatar_url,
          },
        };
      }) ?? [];
  }

  const totalVotes = nominees.reduce((acc, nominee) => acc + Math.max(0, nominee.votesCount), 0);
  const nomineesWithPercentages = nominees.map((nominee) => ({
    ...nominee,
    percentage: totalVotes > 0 ? Math.round((nominee.votesCount / totalVotes) * 100) : 0,
  }));

  const { data: pastRows } = await supabase
    .from("past_spotlight_creators")
    .select("id, spotlight_month, sort_order, influencer_profiles!inner(id, slug, name, short_description, avatar_url)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("spotlight_month", { ascending: false });

  const pastCreators =
    pastRows?.map((row) => {
      const profile = Array.isArray(row.influencer_profiles) ? row.influencer_profiles[0] : row.influencer_profiles;
      return {
        id: row.id,
        spotlightMonth: row.spotlight_month,
        influencer: {
          id: profile.id,
          slug: profile.slug,
          name: profile.name,
          shortDescription: profile.short_description,
          avatarUrl: profile.avatar_url,
        },
      };
    }) ?? [];

  let currentUserVote: { nomineeId: number; nominationMonth: string } | null = null;
  const auth = await resolveAuthenticatedRequest(request);
  if (auth && nominationMonth) {
    const authedSupabase = createAuthedSupabaseClient(auth.accessToken);
    const { data: voteRow } = await authedSupabase
      .from("influencer_votes")
      .select("nominee_id, nomination_month")
      .eq("user_id", auth.userId)
      .eq("nomination_month", nominationMonth)
      .maybeSingle();
    if (voteRow) {
      currentUserVote = {
        nomineeId: voteRow.nominee_id,
        nominationMonth: voteRow.nomination_month,
      };
    }
  }

  const response = NextResponse.json({
    featured: {
      id: featured.id,
      slug: featured.slug,
      name: featured.name,
      shortDescription: featured.short_description,
      description: featured.description,
      avatarUrl: featured.avatar_url,
      featuredMonth: featured.featured_month,
      votesCount: featured.votes_count,
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
    nominees: nomineesWithPercentages,
    pastCreators,
    currentUserVote,
    hasVoted: Boolean(currentUserVote),
    nominationMonth,
  });
  auth?.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);

  const payload = (await request.json().catch(() => null)) as { nomineeId?: number } | null;
  const nomineeId = Number(payload?.nomineeId);
  if (!Number.isFinite(nomineeId) || nomineeId <= 0) {
    return NextResponse.json({ error: "Invalid nominee id." }, { status: 400 });
  }

  const { data: nominee, error: nomineeError } = await supabase
    .from("influencer_next_month_nominees")
    .select("id, votes_count, nomination_month")
    .eq("id", nomineeId)
    .eq("is_published", true)
    .maybeSingle();

  if (nomineeError || !nominee) {
    return NextResponse.json({ error: "Nominee not found." }, { status: 404 });
  }

  const { data: existingVote } = await supabase
    .from("influencer_votes")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("nomination_month", nominee.nomination_month)
    .maybeSingle();

  if (existingVote) {
    return NextResponse.json({ error: "Already voted for this cycle." }, { status: 409 });
  }

  const { error: insertVoteError } = await supabase.from("influencer_votes").insert({
    user_id: auth.userId,
    nominee_id: nomineeId,
    nomination_month: nominee.nomination_month,
  });

  if (insertVoteError) {
    return NextResponse.json({ error: insertVoteError.message }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("influencer_next_month_nominees")
    .update({ votes_count: nominee.votes_count + 1 })
    .eq("id", nomineeId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, votedNomineeId: nomineeId, nominationMonth: nominee.nomination_month });
  auth.applyRefreshedCookies(response);
  return response;
}
