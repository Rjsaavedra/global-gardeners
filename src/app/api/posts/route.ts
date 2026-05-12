import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type CreatePostBody = {
  note?: string;
  photos?: string[];
};

function sanitizePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as CreatePostBody;
  const note = body.note?.trim() ?? "";
  const photos = sanitizePhotos(body.photos);
  if (!photos.length && !note) {
    return NextResponse.json({ error: "Please provide a note or at least one photo." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: createdPost, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: auth.userId,
      content: note,
      note,
      heart_count: 0,
    })
    .select("id")
    .single();

  if (postError || !createdPost) {
    return NextResponse.json({ error: postError?.message ?? "Unable to create post." }, { status: 400 });
  }

  if (photos.length) {
    const photoRows = photos.map((photoUrl, index) => ({
      post_id: createdPost.id,
      user_id: auth.userId,
      photo_url: photoUrl,
      sort_order: index,
    }));

    const { error: photosError } = await supabase.from("post_photos").insert(photoRows);
    if (photosError) {
      return NextResponse.json({ error: photosError.message }, { status: 400 });
    }
  }

  const response = NextResponse.json({ created: true, postId: createdPost.id });
  auth.applyRefreshedCookies(response);
  return response;
}
