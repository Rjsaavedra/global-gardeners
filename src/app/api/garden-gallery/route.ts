import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type CreateGalleryEntryBody = {
  title?: string;
  note?: string;
  photos?: string[];
  attachedPlantIds?: Array<number | string>;
};

function sanitizePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function sanitizePlantIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  const numeric = ids
    .map((value) => {
      if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
      if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isInteger(parsed) && parsed > 0) return parsed;
      }
      return null;
    })
    .filter((value): value is number => value !== null);
  return [...new Set(numeric)];
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("garden_gallery_entries")
    .select("id, title, note, created_at, garden_gallery_photos(photo_url, sort_order), garden_gallery_entry_plants(plant_id, plants(common_name, scientific_name))")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const entries =
    data?.map((row) => {
      const photos = Array.isArray(row.garden_gallery_photos)
        ? [...row.garden_gallery_photos]
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((photo) => photo.photo_url)
            .filter((photo): photo is string => typeof photo === "string")
        : [];

      const plants = Array.isArray(row.garden_gallery_entry_plants)
        ? row.garden_gallery_entry_plants.map((link) => {
            const plantRecord = Array.isArray(link.plants)
              ? (link.plants[0] as { common_name?: string | null; scientific_name?: string | null } | undefined)
              : (link.plants as { common_name?: string | null; scientific_name?: string | null } | null | undefined);
            return {
              plantId: link.plant_id,
              commonName: typeof plantRecord?.common_name === "string" ? plantRecord.common_name : null,
              scientificName: typeof plantRecord?.scientific_name === "string" ? plantRecord.scientific_name : null,
            };
          })
        : [];

      return {
        id: row.id,
        title: row.title ?? "",
        note: row.note ?? "",
        createdAt: row.created_at,
        coverPhotoUrl: photos[0] ?? null,
        photos,
        plants,
      };
    }) ?? [];

  const response = NextResponse.json({ entries });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as CreateGalleryEntryBody;
  const title = body.title?.trim() ?? "";
  const note = body.note?.trim() ?? "";
  const photos = sanitizePhotos(body.photos);
  const attachedPlantIds = sanitizePlantIds(body.attachedPlantIds);

  if (!photos.length) {
    return NextResponse.json({ error: "Please add at least one photo." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Please provide a photo title." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: createdEntry, error: entryError } = await supabase
    .from("garden_gallery_entries")
    .insert({ user_id: auth.userId, title, note })
    .select("id")
    .single();

  if (entryError || !createdEntry) {
    return NextResponse.json({ error: entryError?.message ?? "Unable to create gallery entry." }, { status: 400 });
  }

  if (photos.length) {
    const rows = photos.map((photoUrl, index) => ({
      entry_id: createdEntry.id,
      user_id: auth.userId,
      photo_url: photoUrl,
      sort_order: index,
    }));
    const { error: photosError } = await supabase.from("garden_gallery_photos").insert(rows);
    if (photosError) return NextResponse.json({ error: photosError.message }, { status: 400 });
  }

  if (attachedPlantIds.length) {
    const linkRows = attachedPlantIds.map((plantId) => ({
      entry_id: createdEntry.id,
      plant_id: plantId,
      user_id: auth.userId,
    }));
    const { error: linksError } = await supabase.from("garden_gallery_entry_plants").insert(linkRows);
    if (linksError) return NextResponse.json({ error: linksError.message }, { status: 400 });
  }

  const response = NextResponse.json({ created: true, entryId: createdEntry.id });
  auth.applyRefreshedCookies(response);
  return response;
}
