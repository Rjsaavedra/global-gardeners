import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type HiddenPostsSettings = {
  hiddenPostIds?: string[];
};

function sanitizeHiddenPostIds(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase.from("profiles").select("user_settings").eq("user_id", auth.userId).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const settings = (data?.user_settings ?? {}) as HiddenPostsSettings;
  const hiddenPostIds = sanitizeHiddenPostIds(settings.hiddenPostIds);
  return NextResponse.json({ hiddenPostIds });
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: { postId?: unknown } = {};
  try {
    payload = (await request.json()) as { postId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const postId = typeof payload.postId === "string" ? payload.postId.trim() : "";
  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase.from("profiles").select("user_settings").eq("user_id", auth.userId).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rawSettings = (data?.user_settings ?? {}) as Record<string, unknown>;
  const currentHiddenPostIds = sanitizeHiddenPostIds((rawSettings as HiddenPostsSettings).hiddenPostIds);
  const nextHiddenPostIds = Array.from(new Set([...currentHiddenPostIds, postId]));

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ user_settings: { ...rawSettings, hiddenPostIds: nextHiddenPostIds } })
    .eq("user_id", auth.userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ hiddenPostIds: nextHiddenPostIds });
}

