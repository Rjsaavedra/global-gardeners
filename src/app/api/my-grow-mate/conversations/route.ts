import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("growmate_conversations")
    .select("id, title, plant_id, created_at, updated_at, plants(common_name)")
    .eq("user_id", auth.userId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const conversationIds = (data ?? []).map((row) => row.id);
  const { data: messages } = conversationIds.length
    ? await supabase
        .from("growmate_messages")
        .select("conversation_id, role, content")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [] as Array<{ conversation_id: number; role: "user" | "assistant" | "system"; content: string }> };

  const lastUserMessageByConversation = new Map<number, string>();
  const lastAnyMessageByConversation = new Map<number, string>();
  for (const message of messages ?? []) {
    if (!lastAnyMessageByConversation.has(message.conversation_id)) {
      lastAnyMessageByConversation.set(message.conversation_id, message.content);
    }
    if (message.role === "user" && !lastUserMessageByConversation.has(message.conversation_id)) {
      lastUserMessageByConversation.set(message.conversation_id, message.content);
    }
  }

  const response = NextResponse.json({
    conversations: (data ?? []).map((row) => {
      const excerpt = lastUserMessageByConversation.get(row.id) ?? lastAnyMessageByConversation.get(row.id) ?? "";
      const plantRecord = Array.isArray(row.plants)
        ? (row.plants[0] as { common_name?: string } | undefined)
        : (row.plants as { common_name?: string } | null | undefined);
      const plantTitle = typeof plantRecord?.common_name === "string" ? plantRecord.common_name : "";
      const resolvedTitle =
        row.title && row.title !== "Global Gardeners" ? row.title : plantTitle?.trim() ? plantTitle : "Global Gardeners";

      return {
        id: String(row.id),
        title: resolvedTitle,
        plantId: row.plant_id ? String(row.plant_id) : null,
        updatedAt: row.updated_at,
        excerpt,
      };
    }),
  });
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { title?: string; plantId?: string | number | null } | null;
  const title = body?.title?.trim() || "Global Gardeners";
  const plantId = body?.plantId == null || body.plantId === "" ? null : Number(body.plantId);

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("growmate_conversations")
    .insert({ user_id: auth.userId, title, plant_id: Number.isInteger(plantId) ? plantId : null })
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Unable to create conversation." }, { status: 400 });

  const response = NextResponse.json({ created: true, id: String(data.id) });
  auth.applyRefreshedCookies(response);
  return response;
}
