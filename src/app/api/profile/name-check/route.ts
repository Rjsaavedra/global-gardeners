import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const name = (url.searchParams.get("name") ?? "").trim();
  if (!name) {
    const response = NextResponse.json({ similarNames: [] as string[], hasConflict: false });
    auth.applyRefreshedCookies(response);
    return response;
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .neq("user_id", auth.userId)
    .ilike("full_name", `%${name}%`)
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const similarNames = (data ?? [])
    .map((row) => (typeof row.full_name === "string" ? row.full_name.trim() : ""))
    .filter(Boolean);

  const response = NextResponse.json({
    similarNames,
    hasConflict: similarNames.length > 0,
  });
  auth.applyRefreshedCookies(response);
  return response;
}

