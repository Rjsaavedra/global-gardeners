import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parseEntryId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(request: Request, context: { params: Promise<{ entryId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { entryId } = await context.params;
  const normalizedEntryId = parseEntryId(entryId);
  if (!normalizedEntryId) return NextResponse.json({ error: "Invalid gallery entry id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("garden_gallery_entries")
    .select("id, title, note, created_at, garden_gallery_photos(photo_url, sort_order), garden_gallery_entry_plants(plant_id, plants(common_name, scientific_name))")
    .eq("id", normalizedEntryId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Gallery entry not found." }, { status: 404 });

  const photos = Array.isArray(data.garden_gallery_photos)
    ? [...data.garden_gallery_photos]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((photo) => photo.photo_url)
        .filter((photo): photo is string => typeof photo === "string")
    : [];

  const plants = Array.isArray(data.garden_gallery_entry_plants)
    ? data.garden_gallery_entry_plants.map((link) => ({
        plantId: link.plant_id,
        commonName: Array.isArray(link.plants) ? link.plants[0]?.common_name ?? null : link.plants?.common_name ?? null,
        scientificName: Array.isArray(link.plants) ? link.plants[0]?.scientific_name ?? null : link.plants?.scientific_name ?? null,
      }))
    : [];

  const response = NextResponse.json({
    entry: {
      id: data.id,
      title: data.title ?? "",
      note: data.note ?? "",
      createdAt: data.created_at,
      coverPhotoUrl: photos[0] ?? null,
      photos,
      plants,
    },
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function DELETE(request: Request, context: { params: Promise<{ entryId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { entryId } = await context.params;
  const normalizedEntryId = parseEntryId(entryId);
  if (!normalizedEntryId) return NextResponse.json({ error: "Invalid gallery entry id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase
    .from("garden_gallery_entries")
    .delete()
    .eq("id", normalizedEntryId)
    .eq("user_id", auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ deleted: true });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function PATCH(request: Request, context: { params: Promise<{ entryId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { entryId } = await context.params;
  const normalizedEntryId = parseEntryId(entryId);
  if (!normalizedEntryId) return NextResponse.json({ error: "Invalid gallery entry id." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = (body ?? {}) as {
    title?: unknown;
    note?: unknown;
    photos?: unknown;
    attachedPlantIds?: unknown;
  };

  const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 120) : "";
  const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 800) : "";
  const photos = Array.isArray(payload.photos)
    ? payload.photos.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 5)
    : [];
  const attachedPlantIds = Array.isArray(payload.attachedPlantIds)
    ? payload.attachedPlantIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
        .slice(0, 2)
    : [];

  if (!photos.length) return NextResponse.json({ error: "At least one photo is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);

  const { data: existingEntry, error: existingEntryError } = await supabase
    .from("garden_gallery_entries")
    .select("id")
    .eq("id", normalizedEntryId)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (existingEntryError) return NextResponse.json({ error: existingEntryError.message }, { status: 400 });
  if (!existingEntry) return NextResponse.json({ error: "Gallery entry not found." }, { status: 404 });

  const { error: updateEntryError } = await supabase
    .from("garden_gallery_entries")
    .update({ title, note })
    .eq("id", normalizedEntryId)
    .eq("user_id", auth.userId);
  if (updateEntryError) return NextResponse.json({ error: updateEntryError.message }, { status: 400 });

  const { error: deletePhotosError } = await supabase
    .from("garden_gallery_photos")
    .delete()
    .eq("entry_id", normalizedEntryId);
  if (deletePhotosError) return NextResponse.json({ error: deletePhotosError.message }, { status: 400 });

  const photoRows = photos.map((photoUrl, index) => ({
    entry_id: normalizedEntryId,
    user_id: auth.userId,
    photo_url: photoUrl,
    sort_order: index,
  }));
  const { error: insertPhotosError } = await supabase.from("garden_gallery_photos").insert(photoRows);
  if (insertPhotosError) return NextResponse.json({ error: insertPhotosError.message }, { status: 400 });

  const { error: deleteLinksError } = await supabase
    .from("garden_gallery_entry_plants")
    .delete()
    .eq("entry_id", normalizedEntryId);
  if (deleteLinksError) return NextResponse.json({ error: deleteLinksError.message }, { status: 400 });

  if (attachedPlantIds.length) {
    const { data: ownedPlants, error: ownedPlantsError } = await supabase
      .from("plants")
      .select("id")
      .eq("user_id", auth.userId)
      .in("id", attachedPlantIds);
    if (ownedPlantsError) return NextResponse.json({ error: ownedPlantsError.message }, { status: 400 });

    const ownedPlantIds = new Set((ownedPlants ?? []).map((plant) => plant.id));
    const linkRows = attachedPlantIds
      .filter((plantId) => ownedPlantIds.has(plantId))
      .map((plantId) => ({ entry_id: normalizedEntryId, plant_id: plantId, user_id: auth.userId }));

    if (linkRows.length) {
      const { error: linkInsertError } = await supabase.from("garden_gallery_entry_plants").insert(linkRows);
      if (linkInsertError) return NextResponse.json({ error: linkInsertError.message }, { status: 400 });
    }
  }

  const response = NextResponse.json({ updated: true, entryId: normalizedEntryId });
  auth.applyRefreshedCookies(response);
  return response;
}
