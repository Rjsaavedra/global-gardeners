import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request, context: { params: Promise<{ guideId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { guideId } = await context.params;
  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("guides")
    .select("slug, title, subtitle, read_time_minutes, hero_image_url, body")
    .eq("slug", guideId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Guide not found." }, { status: 404 });

  const response = NextResponse.json({
    guide: {
      id: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      readTime: `${data.read_time_minutes ?? 10} min read`,
      imageUrl: data.hero_image_url || "/images/figma/placeholder-expired.png",
      paragraphs: String(data.body || "").split(/\n\n+/).filter(Boolean),
    },
  });
  auth.applyRefreshedCookies(response);
  return response;
}
