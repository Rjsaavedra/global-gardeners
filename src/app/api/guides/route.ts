import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("guides")
    .select("slug, title, subtitle, read_time_minutes, hero_image_url")
    .eq("is_published", true)
    .order("id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const guides = (data ?? []).map((row) => ({
    id: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    readTime: `${row.read_time_minutes ?? 10} min read`,
    imageUrl: row.hero_image_url || "/images/figma/placeholder-expired.png",
  }));

  const response = NextResponse.json({ guides });
  auth.applyRefreshedCookies(response);
  return response;
}
