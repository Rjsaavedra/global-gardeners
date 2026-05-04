import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type FollowPayload = {
  userId?: string;
};

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as FollowPayload | null;
  const followedUserId = payload?.userId?.trim();

  if (!followedUserId) {
    return NextResponse.json({ error: "Missing user id." }, { status: 400 });
  }

  if (followedUserId === auth.userId) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("user_follows").insert({
    follower_user_id: auth.userId,
    followed_user_id: followedUserId,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!error) {
    await supabase.from("user_notifications").insert({
      user_id: followedUserId,
      actor_user_id: auth.userId,
      type: "follow",
    });
  }

  const response = NextResponse.json({ followed: true, userId: followedUserId });
  auth.applyRefreshedCookies(response);
  return response;
}
