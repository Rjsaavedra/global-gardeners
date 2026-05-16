import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

function parseId(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const MY_GROW_MATE_SYSTEM_PROMPT =
  "You are MyGrowMate, a friendly plant-care assistant. Give practical, safe, step-by-step guidance tailored to the user's plant and context. Keep responses concise, clear, and actionable.";
const DEFAULT_LOG_TYPE = "General";
const CARE_PLAN_TRIGGERS = ["watering", "light", "humidity", "fertiliz", "soil", "pruning", "temperature", "repot", "drainage"];
const GENERAL_TOPIC_TRIGGERS = ["best", "top", "ideas", "types", "recommend", "compare", "indoor plants", "outdoor plants"];
const MAX_IMAGE_COUNT = 3;

async function fetchPlantImagesFromPexels(queryTerms: string[]): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || queryTerms.length === 0) return [];

  const images: string[] = [];
  for (const term of queryTerms.slice(0, MAX_IMAGE_COUNT)) {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(term + " plant")}&per_page=1`, {
      headers: { Authorization: apiKey },
      cache: "no-store",
    });
    if (!response.ok) continue;
    const payload = (await response.json()) as { photos?: Array<{ src?: { medium?: string } }> };
    const url = payload.photos?.[0]?.src?.medium;
    if (url && !images.includes(url)) images.push(url);
  }
  return images.slice(0, MAX_IMAGE_COUNT);
}

function extractPlantTerms(content: string): string[] {
  const boldMatches = [...content.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1].trim());
  const titleMatches = [...content.matchAll(/\d+\.\s*([A-Za-z][A-Za-z\s-]{2,40})/g)].map((m) => m[1].trim());
  const terms = [...boldMatches, ...titleMatches]
    .map((t) => t.replace(/\s*\(.+\)\s*/g, "").trim())
    .filter((t) => t.length >= 3);
  return [...new Set(terms)].slice(0, MAX_IMAGE_COUNT);
}

async function generateAssistantReply(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  contextNote?: string,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "__MISSING_OPENAI_API_KEY__";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: MY_GROW_MATE_SYSTEM_PROMPT },
        {
          role: "system",
          content:
            "Return valid JSON only with shape: {\"label\":\"General|Care Plan\",\"content\":\"...\"}. Use label based on response type.",
        },
        ...(contextNote ? [{ role: "system" as const, content: contextNote }] : []),
        ...history,
      ],
    }),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content?.trim() || null;
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
    .select("id, role, content, metadata, created_at")
    .eq("conversation_id", id)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({
    messages: (data ?? []).map((row) => ({
      id: String(row.id),
      role: row.role,
      content: row.content,
      messageType:
        typeof (row as { metadata?: { messageType?: unknown } }).metadata?.messageType === "string"
          ? ((row as { metadata?: { messageType?: string } }).metadata?.messageType as string)
          : DEFAULT_LOG_TYPE,
      images: Array.isArray((row as { metadata?: { images?: unknown } }).metadata?.images)
        ? (((row as { metadata?: { images?: string[] } }).metadata?.images as string[]) ?? [])
        : [],
      createdAt: row.created_at,
    })),
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
  let assistantMessage = body?.assistantMessage?.trim() || null;
  if (!userMessage) return NextResponse.json({ error: "User message is required." }, { status: 400 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  if (!assistantMessage) {
    const { data: conversationData } = await supabase
      .from("growmate_conversations")
      .select("title, plant_id, plants(common_name, scientific_name)")
      .eq("id", id)
      .eq("user_id", auth.userId)
      .single();

    const plantRecord = Array.isArray(conversationData?.plants)
      ? (conversationData?.plants[0] as { common_name?: string; scientific_name?: string } | undefined)
      : (conversationData?.plants as { common_name?: string; scientific_name?: string } | null | undefined);
    const plantCommonName = plantRecord?.common_name?.trim() || null;
    const plantScientificName = plantRecord?.scientific_name?.trim() || null;
    const conversationTitle = conversationData?.title?.trim() || null;
    const hasExplicitTopic = Boolean(conversationTitle && conversationTitle !== "Global Gardeners");
    const contextNote = [
      hasExplicitTopic ? `Selected topic: ${conversationTitle}.` : null,
      plantCommonName ? `Selected plant: ${plantCommonName}.` : null,
      plantScientificName ? `Scientific name: ${plantScientificName}.` : null,
      "Do not ask the user to provide the plant name/topic again if it's already included above.",
    ]
      .filter(Boolean)
      .join(" ");

    const { data: recentMessages } = await supabase
      .from("growmate_messages")
      .select("role, content")
      .eq("conversation_id", id)
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: true })
      .limit(20);

    const generated = await generateAssistantReply([
      ...((recentMessages ?? []) as Array<{ role: "user" | "assistant" | "system"; content: string }>),
      { role: "user", content: userMessage },
    ], contextNote);
    if (generated === "__MISSING_OPENAI_API_KEY__") {
      assistantMessage = "MyGrowMate setup issue: OPENAI_API_KEY is missing for local development.";
    } else {
      let parsedLabel = DEFAULT_LOG_TYPE;
      let parsedContent: string | null = null;
      try {
        const parsed = JSON.parse(generated ?? "{}") as { label?: string; content?: string };
        if (parsed.label === "General" || parsed.label === "Care Plan") parsedLabel = parsed.label;
        if (typeof parsed.content === "string" && parsed.content.trim()) parsedContent = parsed.content.trim();
      } catch {
        parsedContent = null;
      }
      const finalContent = parsedContent ?? generated ?? "I couldn't generate a response right now. Please try again.";
      const finalContentLower = finalContent.toLowerCase();
      const topicLower = (conversationTitle ?? "").toLowerCase();
      const listLike = /(^|\n)\s*(\d+[\).\-\s]|[-*]\s)/.test(finalContent);
      const careSignalCount = CARE_PLAN_TRIGGERS.filter((token) => finalContentLower.includes(token)).length;
      const highConfidenceCarePlan = careSignalCount >= 3 && (finalContentLower.includes("your plant") || finalContentLower.includes("this plant"));
      const broadTopic = GENERAL_TOPIC_TRIGGERS.some((token) => topicLower.includes(token));
      const looksLikeRecommendationList = listLike && !highConfidenceCarePlan;
      const finalLabel =
        broadTopic || looksLikeRecommendationList
          ? "General"
          : highConfidenceCarePlan
            ? "Care Plan"
            : parsedLabel;
      assistantMessage = finalContent;
      body!.assistantMessage = finalLabel;
    }
  }

  const imageTerms = assistantMessage ? extractPlantTerms(assistantMessage) : [];
  const assistantImages = await fetchPlantImagesFromPexels(imageTerms);

  const rows = [
    { conversation_id: id, user_id: auth.userId, role: "user", content: userMessage, metadata: {} },
    {
      conversation_id: id,
      user_id: auth.userId,
      role: "assistant",
      content: assistantMessage,
      metadata: {
        messageType: body?.assistantMessage === "Care Plan" ? "Care Plan" : DEFAULT_LOG_TYPE,
        images: assistantImages,
      },
    },
  ];
  const { error } = await supabase.from("growmate_messages").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("growmate_conversations").update({ updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", auth.userId);

  const response = NextResponse.json({ created: true, assistantMessage });
  auth.applyRefreshedCookies(response);
  return response;
}
