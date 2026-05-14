import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { suggestionText?: string } | null;
  const suggestionText = (payload?.suggestionText ?? "").trim();
  if (suggestionText.length < 3) {
    return NextResponse.json({ error: "Suggestion is too short." }, { status: 400 });
  }
  if (suggestionText.length > 2000) {
    return NextResponse.json({ error: "Suggestion is too long." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("influencer_creator_suggestions").insert({
    user_id: auth.userId,
    suggestion_text: suggestionText,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  auth.applyRefreshedCookies(response);
  return response;
}

