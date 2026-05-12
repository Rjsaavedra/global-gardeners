import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parseId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await context.params;
  const id = parseId(conversationId);
  if (!id) return NextResponse.json({ error: "Invalid conversation id." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("growmate_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({
    messages: (data ?? []).map((row) => ({ id: String(row.id), role: row.role, content: row.content, createdAt: row.created_at })),
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { conversationId } = await context.params;
  const id = parseId(conversationId);
  if (!id) return NextResponse.json({ error: "Invalid conversation id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { userMessage?: string; assistantMessage?: string } | null;
  const userMessage = body?.userMessage?.trim();
  const assistantMessage = body?.assistantMessage?.trim();
  if (!userMessage) return NextResponse.json({ error: "User message is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const rows = [
    { conversation_id: id, user_id: auth.userId, role: "user", content: userMessage },
    ...(assistantMessage ? [{ conversation_id: id, user_id: auth.userId, role: "assistant", content: assistantMessage }] : []),
  ];
  const { error } = await supabase.from("growmate_messages").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("growmate_conversations").update({ updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", auth.userId);

  const response = NextResponse.json({ created: true });
  auth.applyRefreshedCookies(response);
  return response;
}
