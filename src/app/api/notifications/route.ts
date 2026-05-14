import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationRow = {
  id: number;
  type: "follow" | "post_like" | "post_comment";
  created_at: string;
  is_read: boolean;
  actor_user_id: string | null;
  post_id: number | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  nickname: string | null;
  profile_photo_url: string | null;
};

type FollowRow = {
  followed_user_id: string;
};

function toTimeAgo(createdAt: string) {
  const date = new Date(createdAt);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, type, created_at, is_read, actor_user_id, post_id")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = (data ?? []) as NotificationRow[];
  const actorIds = [...new Set(rows.map((row) => row.actor_user_id).filter((value): value is string => Boolean(value)))];
  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("user_id, full_name, nickname, profile_photo_url").in("user_id", actorIds)
    : { data: [] as ProfileRow[] };
  const profilesByUserId = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
  const { data: followRows } = actorIds.length
    ? await supabase
        .from("user_follows")
        .select("followed_user_id")
        .eq("follower_user_id", auth.userId)
        .in("followed_user_id", actorIds)
    : { data: [] as FollowRow[] };
  const followedActorIds = new Set((followRows ?? []).map((row) => row.followed_user_id));

  const notifications = rows.map((row) => {
    const profile = row.actor_user_id ? profilesByUserId.get(row.actor_user_id) : undefined;
    const name = profile?.full_name?.trim() || profile?.nickname?.trim() || "Global Gardener";
    let message = "sent you a notification";
    let canFollowBack = false;
    if (row.type === "follow") {
      message = "started following you";
      canFollowBack = !followedActorIds.has(row.actor_user_id ?? "");
    } else if (row.type === "post_like") {
      message = "liked your post";
    } else if (row.type === "post_comment") {
      message = "commented on your post";
    }

    return {
      id: String(row.id),
      name,
      time: toTimeAgo(row.created_at),
      message,
      avatarUrl: profile?.profile_photo_url?.trim() || undefined,
      canFollowBack,
      isRead: row.is_read,
      actorUserId: row.actor_user_id ?? undefined,
      postId: row.post_id ? String(row.post_id) : undefined,
      type: row.type,
    };
  });

  const unreadCount = rows.filter((row) => !row.is_read).length;
  const response = NextResponse.json({ notifications, unreadCount });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { notificationId?: string } | null;
  const notificationIdRaw = body?.notificationId?.trim();
  const notificationId = notificationIdRaw ? Number.parseInt(notificationIdRaw, 10) : null;
  if (!notificationId || !Number.isInteger(notificationId) || notificationId <= 0) {
    return NextResponse.json({ error: "Invalid notification id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase
    .from("user_notifications")
    .update({ is_read: true })
    .eq("user_id", auth.userId)
    .eq("id", notificationId)
    .eq("is_read", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  auth.applyRefreshedCookies(response);
  return response;
}
