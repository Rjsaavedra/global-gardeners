import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parsePlantId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(request: Request, context: { params: Promise<{ plantId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { plantId } = await context.params;
  const normalizedPlantId = parsePlantId(plantId);
  if (!normalizedPlantId) {
    return NextResponse.json({ error: "Invalid plant id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: plant, error: plantError } = await supabase
    .from("plants")
    .select("id, common_name, scientific_name, description, created_at")
    .eq("id", normalizedPlantId)
    .eq("user_id", auth.userId)
    .eq("is_archived", false)
    .maybeSingle();

  if (plantError) {
    return NextResponse.json({ error: plantError.message }, { status: 400 });
  }
  if (!plant) {
    return NextResponse.json({ error: "Plant not found." }, { status: 404 });
  }

  const [{ data: photos }, { data: careProfile }, { data: careSections }] = await Promise.all([
    supabase.from("plant_photos").select("photo_url, sort_order").eq("plant_id", normalizedPlantId).order("sort_order", { ascending: true }),
    supabase.from("plant_care_profiles").select("light_level, watering_interval_days, temperature_min_c, temperature_max_c, humidity_percent").eq("plant_id", normalizedPlantId).maybeSingle(),
    supabase.from("plant_care_sections").select("section_key, title, content, sort_order").eq("plant_id", normalizedPlantId).order("sort_order", { ascending: true }),
  ]);

  const response = NextResponse.json({
    plant: {
      id: plant.id,
      commonName: plant.common_name,
      scientificName: plant.scientific_name,
      description: plant.description,
      createdAt: plant.created_at,
      photos: photos ?? [],
      careProfile: careProfile ?? null,
      careSections: careSections ?? [],
    },
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function DELETE(request: Request, context: { params: Promise<{ plantId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { plantId } = await context.params;
  const normalizedPlantId = parsePlantId(plantId);
  if (!normalizedPlantId) {
    return NextResponse.json({ error: "Invalid plant id." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("plants").update({ is_archived: true }).eq("id", normalizedPlantId).eq("user_id", auth.userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ deleted: true });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function PATCH(request: Request, context: { params: Promise<{ plantId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { plantId } = await context.params;
  const normalizedPlantId = parsePlantId(plantId);
  if (!normalizedPlantId) {
    return NextResponse.json({ error: "Invalid plant id." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        commonName?: string;
        scientificName?: string;
        description?: string;
        photos?: string[];
      }
    | null;

  const commonName = body?.commonName?.trim() || "Rattlesnake Plant";
  const scientificName = body?.scientificName?.trim() || "Goeppertia insignis";
  const description = body?.description?.trim() || "Rattlesnake plant updated from retake flow.";
  const photos = Array.isArray(body?.photos) ? body!.photos.filter((p): p is string => typeof p === "string" && p.trim().length > 0) : [];

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: existingPlant, error: existingPlantError } = await supabase
    .from("plants")
    .select("id")
    .eq("id", normalizedPlantId)
    .eq("user_id", auth.userId)
    .eq("is_archived", false)
    .maybeSingle();

  if (existingPlantError) {
    return NextResponse.json({ error: existingPlantError.message }, { status: 400 });
  }
  if (!existingPlant) {
    return NextResponse.json({ error: "Plant not found." }, { status: 404 });
  }

  const { error: plantUpdateError } = await supabase
    .from("plants")
    .update({
      common_name: commonName,
      scientific_name: scientificName || null,
      description: description || null,
    })
    .eq("id", normalizedPlantId)
    .eq("user_id", auth.userId);
  if (plantUpdateError) {
    return NextResponse.json({ error: plantUpdateError.message }, { status: 400 });
  }

  if (photos.length) {
    const { error: clearPhotosError } = await supabase.from("plant_photos").delete().eq("plant_id", normalizedPlantId).eq("user_id", auth.userId);
    if (clearPhotosError) {
      return NextResponse.json({ error: clearPhotosError.message }, { status: 400 });
    }
    const rows = photos.map((photoUrl, index) => ({
      plant_id: normalizedPlantId,
      user_id: auth.userId,
      photo_url: photoUrl,
      sort_order: index,
      source: "identification",
    }));
    const { error: insertPhotosError } = await supabase.from("plant_photos").insert(rows);
    if (insertPhotosError) {
      return NextResponse.json({ error: insertPhotosError.message }, { status: 400 });
    }
  }

  const response = NextResponse.json({ updated: true, plantId: normalizedPlantId });
  auth.applyRefreshedCookies(response);
  return response;
}
