import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type Params = {
  params: Promise<{
    postId: string;
  }>;
};

function parseId(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

async function getPostHeartCount(supabase: ReturnType<typeof createAuthedSupabaseClient>, postId: number) {
  const { count } = await supabase
    .from("post_hearts")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  return Math.max(0, count ?? 0);
}

export async function POST(request: Request, context: Params) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { postId } = await context.params;
  const normalizedPostId = parseId(postId);
  if (!normalizedPostId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: post } = await supabase.from("posts").select("id, user_id").eq("id", normalizedPostId).maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("post_hearts").insert({
    post_id: normalizedPostId,
    user_id: auth.userId,
  });
  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  if (!insertError && post.user_id && post.user_id !== auth.userId) {
    await supabase.from("user_notifications").insert({
      user_id: post.user_id,
      actor_user_id: auth.userId,
      post_id: normalizedPostId,
      type: "post_like",
    });
  }

  const response = NextResponse.json({
    likedByMe: true,
    heartCount: await getPostHeartCount(supabase, normalizedPostId),
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function DELETE(request: Request, context: Params) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { postId } = await context.params;
  const normalizedPostId = parseId(postId);
  if (!normalizedPostId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error: deleteError } = await supabase
    .from("post_hearts")
    .delete()
    .eq("post_id", normalizedPostId)
    .eq("user_id", auth.userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  const response = NextResponse.json({
    likedByMe: false,
    heartCount: await getPostHeartCount(supabase, normalizedPostId),
  });
  auth.applyRefreshedCookies(response);
  return response;
}
