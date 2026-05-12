import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parseId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function DELETE(request: Request, context: { params: Promise<{ logId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { logId } = await context.params;
  const id = parseId(logId);
  if (!id) return NextResponse.json({ error: "Invalid log id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("growmate_logs").delete().eq("id", id).eq("user_id", auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ deleted: true });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function PATCH(request: Request, context: { params: Promise<{ logId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { logId } = await context.params;
  const id = parseId(logId);
  if (!id) return NextResponse.json({ error: "Invalid log id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = body?.title?.trim();
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { error } = await supabase.from("growmate_logs").update({ title }).eq("id", id).eq("user_id", auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ updated: true });
  auth.applyRefreshedCookies(response);
  return response;
}
