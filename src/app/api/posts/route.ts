import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type CreatePostBody = {
  note?: string;
  photos?: string[];
  attachedPlantIds?: Array<number | string>;
  timelinePlantIds?: Array<number | string>;
};

function sanitizePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function sanitizeAttachedPlantIds(attachedPlantIds: unknown): number[] {
  if (!Array.isArray(attachedPlantIds)) return [];
  const numericIds = attachedPlantIds
    .map((value) => {
      if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
      if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isInteger(parsed) && parsed > 0) return parsed;
      }
      return null;
    })
    .filter((value): value is number => value !== null);
  return [...new Set(numericIds)];
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as CreatePostBody;
  const note = body.note?.trim() ?? "";
  const photos = sanitizePhotos(body.photos);
  const attachedPlantIds = sanitizeAttachedPlantIds(body.attachedPlantIds);
  const timelinePlantIds = sanitizeAttachedPlantIds(body.timelinePlantIds);
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

  if (attachedPlantIds.length) {
    const plantRows = attachedPlantIds.map((plantId) => ({
      post_id: createdPost.id,
      plant_id: plantId,
      user_id: auth.userId,
    }));
    const { error: postPlantsError } = await supabase.from("post_plants").insert(plantRows);
    if (postPlantsError) {
      return NextResponse.json({ error: postPlantsError.message }, { status: 400 });
    }
  }

  if (timelinePlantIds.length) {
    const attachedPlantIdSet = new Set(attachedPlantIds);
    const effectiveTimelinePlantIds = timelinePlantIds.filter((plantId) => attachedPlantIdSet.has(plantId));
    if (effectiveTimelinePlantIds.length) {
      const observedOn = new Date().toISOString().slice(0, 10);
      const timelineRows = effectiveTimelinePlantIds.map((plantId) => ({
        plant_id: plantId,
        user_id: auth.userId,
        photos,
        note,
        observed_on: observedOn,
      }));
      const { error: timelineError } = await supabase.from("plant_timeline_updates").insert(timelineRows);
      if (timelineError) {
        return NextResponse.json({ error: timelineError.message }, { status: 400 });
      }
    }
  }

  const response = NextResponse.json({ created: true, postId: createdPost.id });
  auth.applyRefreshedCookies(response);
  return response;
}
