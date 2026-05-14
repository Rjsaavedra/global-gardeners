import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);

  const [{ count: postCount, error: postsError }, { count: careLogCount, error: logsError }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", auth.userId),
    supabase.from("mygrowmate_logs").select("id", { count: "exact", head: true }).eq("user_id", auth.userId),
  ]);

  if (postsError) return NextResponse.json({ error: postsError.message }, { status: 400 });
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 400 });

  const response = NextResponse.json({
    careLogCount: careLogCount ?? 0,
    postCount: postCount ?? 0,
  });
  auth.applyRefreshedCookies(response);
  return response;
}
