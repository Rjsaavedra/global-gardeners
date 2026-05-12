import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type CreatePlantBody = {
  commonName?: string;
  scientificName?: string;
  description?: string;
  photos?: string[];
  lightLevel?: string;
  wateringIntervalDays?: number;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  humidityPercent?: number;
  careSections?: Array<{
    sectionKey: string;
    title: string;
    content: string;
    sortOrder?: number;
  }>;
};

function sanitizePhotos(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];
  return photos.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: plants, error } = await supabase
    .from("plants")
    .select("id, common_name, scientific_name, created_at, plant_photos(photo_url, sort_order)")
    .eq("user_id", auth.userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const normalized =
    plants?.map((plant) => {
      const photos = Array.isArray(plant.plant_photos) ? [...plant.plant_photos].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) : [];
      return {
        id: plant.id,
        commonName: plant.common_name,
        scientificName: plant.scientific_name,
        coverPhotoUrl: photos[0]?.photo_url ?? null,
        createdAt: plant.created_at,
      };
    }) ?? [];

  const response = NextResponse.json({ plants: normalized });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as CreatePlantBody;
  const commonName = body.commonName?.trim() ?? "";
  const scientificName = body.scientificName?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const photos = sanitizePhotos(body.photos);
  if (!commonName) {
    return NextResponse.json({ error: "Plant common name is required." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: createdPlant, error: plantError } = await supabase
    .from("plants")
    .insert({
      user_id: auth.userId,
      common_name: commonName,
      scientific_name: scientificName || null,
      description: description || null,
    })
    .select("id")
    .single();

  if (plantError || !createdPlant) {
    return NextResponse.json({ error: plantError?.message ?? "Unable to create plant." }, { status: 400 });
  }

  if (photos.length) {
    const photoRows = photos.map((photoUrl, index) => ({
      plant_id: createdPlant.id,
      user_id: auth.userId,
      photo_url: photoUrl,
      sort_order: index,
      source: "identification",
    }));
    const { error: photosError } = await supabase.from("plant_photos").insert(photoRows);
    if (photosError) {
      return NextResponse.json({ error: photosError.message }, { status: 400 });
    }
  }

  const { error: careProfileError } = await supabase.from("plant_care_profiles").insert({
    plant_id: createdPlant.id,
    user_id: auth.userId,
    light_level: body.lightLevel ?? null,
    watering_interval_days: typeof body.wateringIntervalDays === "number" ? body.wateringIntervalDays : null,
    temperature_min_c: typeof body.temperatureMinC === "number" ? body.temperatureMinC : null,
    temperature_max_c: typeof body.temperatureMaxC === "number" ? body.temperatureMaxC : null,
    humidity_percent: typeof body.humidityPercent === "number" ? body.humidityPercent : null,
  });

  if (careProfileError) {
    return NextResponse.json({ error: careProfileError.message }, { status: 400 });
  }

  if (Array.isArray(body.careSections) && body.careSections.length) {
    const sectionRows = body.careSections
      .map((section, index) => ({
        plant_id: createdPlant.id,
        user_id: auth.userId,
        section_key: section.sectionKey?.trim(),
        title: section.title?.trim(),
        content: section.content?.trim(),
        sort_order: typeof section.sortOrder === "number" ? section.sortOrder : index,
      }))
      .filter((section) => section.section_key && section.title && section.content);

    if (sectionRows.length) {
      const { error: sectionsError } = await supabase.from("plant_care_sections").insert(sectionRows);
      if (sectionsError) {
        return NextResponse.json({ error: sectionsError.message }, { status: 400 });
      }
    }
  }

  const response = NextResponse.json({ created: true, plantId: createdPlant.id });
  auth.applyRefreshedCookies(response);
  return response;
}
