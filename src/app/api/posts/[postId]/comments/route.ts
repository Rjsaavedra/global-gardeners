import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type CommentRow = {
  id: number;
  user_id: string;
  comment_text: string;
  created_at: string;
  parent_comment_id: number | null;
};

type LegacyCommentRow = Omit<CommentRow, "parent_comment_id">;

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  nickname: string | null;
  profile_photo_url: string | null;
};

type CommentHeartRow = {
  comment_id: number;
  user_id: string;
};

type AuthUser = {
  user_metadata?: {
    full_name?: string;
  };
  email?: string | null;
};

type Params = {
  params: Promise<{
    postId: string;
  }>;
};

function toNickname(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, "").toLowerCase();
  return normalized ? `@${normalized}` : "";
}

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

function parsePostId(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function isMissingParentCommentColumn(errorMessage: string | undefined) {
  if (!errorMessage) {
    return false;
  }

  return (
    errorMessage.includes("post_comments.parent_comment_id") ||
    errorMessage.includes("column parent_comment_id does not exist")
  );
}

export async function GET(request: Request, context: Params) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { postId } = await context.params;
  const normalizedPostId = parsePostId(postId);
  if (!normalizedPostId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: authData } = await supabase.auth.getUser();
  const authUser = (authData?.user ?? null) as AuthUser | null;
  const metadataName = typeof authUser?.user_metadata?.full_name === "string" ? authUser.user_metadata.full_name.trim() : "";
  const emailName = authUser?.email?.split("@")[0]?.trim() ?? "";
  const ownFallbackFullName = metadataName || emailName || "Global Gardener";
  const ownFallbackNickname = toNickname(ownFallbackFullName);
  const { data: comments, error: commentsError } = await supabase
    .from("post_comments")
    .select("id, user_id, comment_text, created_at, parent_comment_id")
    .eq("post_id", normalizedPostId)
    .order("created_at", { ascending: true });

  let commentRows: CommentRow[] = (comments ?? []) as CommentRow[];

  if (commentsError && isMissingParentCommentColumn(commentsError.message)) {
    const { data: fallbackComments, error: fallbackError } = await supabase
      .from("post_comments")
      .select("id, user_id, comment_text, created_at")
      .eq("post_id", normalizedPostId)
      .order("created_at", { ascending: true });

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 400 });
    }

    commentRows = ((fallbackComments ?? []) as LegacyCommentRow[]).map((comment) => ({
      ...comment,
      parent_comment_id: null,
    }));
  } else if (commentsError) {
    return NextResponse.json({ error: commentsError.message }, { status: 400 });
  }
  const userIds = [...new Set(commentRows.map((comment) => comment.user_id))];
  const commentIds = commentRows.map((comment) => comment.id);

  const [{ data: profiles }, heartsResult] = await Promise.all([
    userIds.length
      ? supabase
          .from("profiles")
          .select("user_id, full_name, nickname, profile_photo_url")
          .in("user_id", userIds)
      : Promise.resolve({ data: [] as ProfileRow[] }),
    commentIds.length
      ? supabase.from("comment_hearts").select("comment_id, user_id").in("comment_id", commentIds)
      : Promise.resolve({ data: [] as CommentHeartRow[] }),
  ]);

  const profilesByUserId = new Map<string, ProfileRow>();
  for (const profile of (profiles ?? []) as ProfileRow[]) {
    profilesByUserId.set(profile.user_id, profile);
  }
  const heartCountByCommentId = new Map<number, number>();
  const likedCommentIdsByMe = new Set<number>();
  for (const heart of (heartsResult.data ?? []) as CommentHeartRow[]) {
    heartCountByCommentId.set(heart.comment_id, (heartCountByCommentId.get(heart.comment_id) ?? 0) + 1);
    if (heart.user_id === auth.userId) {
      likedCommentIdsByMe.add(heart.comment_id);
    }
  }

  const mappedComments = commentRows.map((comment) => {
    const profile = profilesByUserId.get(comment.user_id);
    const isOwnComment = comment.user_id === auth.userId;
    const profileFullName = profile?.full_name?.trim() || "";
    const fullName = profileFullName || (isOwnComment ? ownFallbackFullName : "Global Gardener");
    const nickname = profile?.nickname?.trim() || (isOwnComment ? ownFallbackNickname : toNickname(fullName));

    return {
      id: String(comment.id),
      text: comment.comment_text,
      publishedAgo: toTimeAgo(comment.created_at),
      parentCommentId: comment.parent_comment_id ? String(comment.parent_comment_id) : null,
      heartCount: heartCountByCommentId.get(comment.id) ?? 0,
      likedByMe: likedCommentIdsByMe.has(comment.id),
      author: {
        fullName,
        nickname,
        profilePhotoUrl: profile?.profile_photo_url?.trim() || null,
      },
    };
  });

  const repliesByParent = new Map<string, (typeof mappedComments)[number][]>();
  for (const comment of mappedComments) {
    if (!comment.parentCommentId) {
      continue;
    }
    const replies = repliesByParent.get(comment.parentCommentId) ?? [];
    replies.push(comment);
    repliesByParent.set(comment.parentCommentId, replies);
  }

  const threads = mappedComments
    .filter((comment) => !comment.parentCommentId)
    .map((comment) => ({
      ...comment,
      replies: repliesByParent.get(comment.id) ?? [],
    }));

  const response = NextResponse.json({
    comments: threads,
    totalCount: mappedComments.length,
  });
  auth.applyRefreshedCookies(response);
  return response;
}

type CreateCommentBody = {
  text?: string;
  parentCommentId?: string;
};

export async function POST(request: Request, context: Params) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { postId } = await context.params;
  const normalizedPostId = parsePostId(postId);
  if (!normalizedPostId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const body = (await request.json()) as CreateCommentBody;
  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  const parentCommentId = body.parentCommentId?.trim() || null;
  let normalizedParentCommentId: number | null = null;
  if (parentCommentId) {
    normalizedParentCommentId = Number.parseInt(parentCommentId, 10);
    if (!Number.isInteger(normalizedParentCommentId) || normalizedParentCommentId <= 0) {
      return NextResponse.json({ error: "Invalid parent comment." }, { status: 400 });
    }
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: authData } = await supabase.auth.getUser();
  const authUser = (authData?.user ?? null) as AuthUser | null;
  const metadataName = typeof authUser?.user_metadata?.full_name === "string" ? authUser.user_metadata.full_name.trim() : "";
  const emailName = authUser?.email?.split("@")[0]?.trim() ?? "";
  const ownFallbackFullName = metadataName || emailName || "Global Gardener";

  if (normalizedParentCommentId) {
    const { error: repliesCheckError } = await supabase
      .from("post_comments")
      .select("id, parent_comment_id")
      .limit(1);

    if (repliesCheckError && isMissingParentCommentColumn(repliesCheckError.message)) {
      normalizedParentCommentId = null;
    } else if (repliesCheckError) {
      return NextResponse.json({ error: repliesCheckError.message }, { status: 400 });
    }

    if (normalizedParentCommentId) {
      const { data: parent, error: parentError } = await supabase
        .from("post_comments")
        .select("id")
        .eq("id", normalizedParentCommentId)
        .eq("post_id", normalizedPostId)
        .maybeSingle();

      if (parentError || !parent) {
        return NextResponse.json({ error: "Parent comment not found." }, { status: 400 });
      }
    }
  }

  let createdComment:
    | {
        id: number;
        comment_text: string;
        created_at: string;
        parent_comment_id: number | null;
      }
    | null = null;

  if (normalizedParentCommentId) {
    const { data, error: createError } = await supabase
      .from("post_comments")
      .insert({
        post_id: normalizedPostId,
        user_id: auth.userId,
        comment_text: text,
        parent_comment_id: normalizedParentCommentId,
      })
      .select("id, comment_text, created_at, parent_comment_id")
      .single();

    if (createError || !data) {
      return NextResponse.json({ error: createError?.message ?? "Unable to add comment." }, { status: 400 });
    }

    createdComment = data;
  } else {
    const { data, error: createError } = await supabase
      .from("post_comments")
      .insert({
        post_id: normalizedPostId,
        user_id: auth.userId,
        comment_text: text,
      })
      .select("id, comment_text, created_at")
      .single();

    const typedData = data as
      | {
          id: number;
          comment_text: string;
          created_at: string;
        }
      | null;
    if (createError || !typedData) {
      return NextResponse.json({ error: createError?.message ?? "Unable to add comment." }, { status: 400 });
    }

    createdComment = {
      ...typedData,
      parent_comment_id: null,
    };
  }
  if (!createdComment) {
    return NextResponse.json({ error: "Unable to add comment." }, { status: 400 });
  }

  const [{ data: profile }, { data: post }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, nickname, profile_photo_url")
      .eq("user_id", auth.userId)
      .maybeSingle(),
    supabase.from("posts").select("comment_count, user_id").eq("id", normalizedPostId).maybeSingle(),
  ]);

  if (post?.user_id && post.user_id !== auth.userId) {
    await supabase.from("user_notifications").insert({
      user_id: post.user_id,
      actor_user_id: auth.userId,
      post_id: normalizedPostId,
      comment_id: createdComment.id,
      type: "post_comment",
    });
  }

  const fullName = profile?.full_name?.trim() || "";
  const resolvedFullName = fullName || ownFallbackFullName;
  const response = NextResponse.json({
    comment: {
      id: String(createdComment.id),
      text: createdComment.comment_text,
      publishedAgo: toTimeAgo(createdComment.created_at),
      parentCommentId: createdComment.parent_comment_id ? String(createdComment.parent_comment_id) : null,
      heartCount: 0,
      likedByMe: false,
      author: {
        fullName: resolvedFullName,
        nickname: profile?.nickname?.trim() || toNickname(resolvedFullName),
        profilePhotoUrl: profile?.profile_photo_url?.trim() || null,
      },
    },
    totalCount: Math.max(0, post?.comment_count ?? 0),
  });

  auth.applyRefreshedCookies(response);
  return response;
}
