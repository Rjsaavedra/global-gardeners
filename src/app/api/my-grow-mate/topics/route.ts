import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data, error } = await supabase
    .from("growmate_topics")
    .select("id, label, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({
    topics: (data ?? []).map((row) => ({
      id: String(row.id),
      label: row.label,
    })),
  });
  auth.applyRefreshedCookies(response);
  return response;
}
