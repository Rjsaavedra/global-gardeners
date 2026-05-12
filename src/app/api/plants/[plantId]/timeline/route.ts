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
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { plantId } = await context.params;
  const normalizedPlantId = parsePlantId(plantId);
  if (!normalizedPlantId) return NextResponse.json({ error: "Invalid plant id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("plant_timeline_updates")
    .select("id, photos, note, observed_on, created_at")
    .eq("plant_id", normalizedPlantId)
    .eq("user_id", auth.userId)
    .order("observed_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const updates =
    data?.map((row) => {
      const photos = Array.isArray(row.photos) ? row.photos.filter((item): item is string => typeof item === "string") : [];
      return {
        id: String(row.id),
        photos,
        photo: photos[0] ?? "",
        note: row.note ?? "",
        date: row.observed_on,
      };
    }) ?? [];

  const response = NextResponse.json({ updates });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request, context: { params: Promise<{ plantId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { plantId } = await context.params;
  const normalizedPlantId = parsePlantId(plantId);
  if (!normalizedPlantId) return NextResponse.json({ error: "Invalid plant id." }, { status: 400 });

  const body = (await request.json()) as { photos?: unknown; note?: unknown; date?: unknown };
  const photos = Array.isArray(body.photos) ? body.photos.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const date = typeof body.date === "string" && body.date.trim() ? body.date.trim() : null;
  if (!date) return NextResponse.json({ error: "Date is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("plant_timeline_updates")
    .insert({
      plant_id: normalizedPlantId,
      user_id: auth.userId,
      photos,
      note,
      observed_on: date,
    })
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Unable to create timeline update." }, { status: 400 });

  const response = NextResponse.json({ created: true, id: String(data.id) });
  auth.applyRefreshedCookies(response);
  return response;
}
