import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parseId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await context.params;
  const id = parseId(conversationId);
  if (!id) return NextResponse.json({ error: "Invalid conversation id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { title?: string; plantId?: string | number | null; isArchived?: boolean } | null;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body?.title === "string") updates.title = body.title.trim() || "New conversation";
  if (body && "plantId" in body) {
    const parsedPlantId = body.plantId == null || body.plantId === "" ? null : Number(body.plantId);
    updates.plant_id = Number.isInteger(parsedPlantId) ? parsedPlantId : null;
  }
  if (typeof body?.isArchived === "boolean") updates.is_archived = body.isArchived;

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("growmate_conversations").update(updates).eq("id", id).eq("user_id", auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ updated: true });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function DELETE(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await context.params;
  const id = parseId(conversationId);
  if (!id) return NextResponse.json({ error: "Invalid conversation id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase
    .from("growmate_conversations")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ deleted: true });
  auth.applyRefreshedCookies(response);
  return response;
}
