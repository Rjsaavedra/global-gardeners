import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type GrowmateLogRow = {
  id: number;
  title: string;
  topic: string;
  content: string;
  plant_id: number | null;
  conversation_id: number | null;
  created_at: string;
  plants: { common_name: string | null } | { common_name: string | null }[] | null;
  growmate_log_types: { name: string | null } | { name: string | null }[] | null;
  growmate_conversations: { title: string | null } | { title: string | null }[] | null;
};

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("growmate_logs")
    .select("id, plant_id, conversation_id, title, topic, content, created_at, plants(common_name), growmate_log_types(name), growmate_conversations(title)")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const logs = ((data ?? []) as GrowmateLogRow[]).map((row) => ({
    id: String(row.id),
    title: row.title,
    topic: row.topic,
    content: row.content,
    plantId: row.plant_id ? String(row.plant_id) : null,
    conversationId: row.conversation_id ? String(row.conversation_id) : null,
    plant: Array.isArray(row.plants) ? row.plants[0]?.common_name ?? "Plant name" : row.plants?.common_name ?? "Plant name",
    conversationTitle: Array.isArray(row.growmate_conversations) ? row.growmate_conversations[0]?.title ?? "Global Gardeners" : row.growmate_conversations?.title ?? "Global Gardeners",
    logType: Array.isArray(row.growmate_log_types) ? row.growmate_log_types[0]?.name ?? row.topic : row.growmate_log_types?.name ?? row.topic,
    createdAt: row.created_at,
  }));

  const response = NextResponse.json({ logs });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    topic?: string;
    content?: string;
    plantId?: string | number | null;
    conversationId?: string | number | null;
  } | null;
  const title = body?.title?.trim() || "Care Plan";
  const topic = body?.topic?.trim() || "Care Plan";
  const content = body?.content?.trim();
  const plantId = body?.plantId == null || body.plantId === "" ? null : Number(body.plantId);
  const conversationId = body?.conversationId == null || body.conversationId === "" ? null : Number(body.conversationId);
  if (!content) return NextResponse.json({ error: "Log content is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: logTypeRow } = await supabase.from("growmate_log_types").select("id").eq("name", topic).maybeSingle();

  const insertPayload: Record<string, unknown> = {
    user_id: auth.userId,
    plant_id: Number.isInteger(plantId) ? plantId : null,
    title,
    topic,
    content,
  };
  if (Number.isInteger(conversationId)) insertPayload.conversation_id = conversationId;
  if (logTypeRow?.id) insertPayload.log_type_id = logTypeRow.id;

  let insertResult = await supabase.from("growmate_logs").insert(insertPayload).select("id").single();
  if (insertResult.error) {
    const fallbackPayload = {
      user_id: auth.userId,
      plant_id: Number.isInteger(plantId) ? plantId : null,
      title,
      topic,
      content,
    };
    insertResult = await supabase.from("growmate_logs").insert(fallbackPayload).select("id").single();
  }

  const { data, error } = insertResult;

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Unable to save log." }, { status: 400 });

  const response = NextResponse.json({ created: true, id: String(data.id) });
  auth.applyRefreshedCookies(response);
  return response;
}
