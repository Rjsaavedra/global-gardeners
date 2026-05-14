import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";
import { getOnboardingStatus } from "@/lib/supabase/onboarding-status";

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const status = await getOnboardingStatus(auth.accessToken);
  const response = NextResponse.json(status);
  auth.applyRefreshedCookies(response);
  return response;
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { dismissProfileSetup?: boolean } | null;
  if (!body?.dismissProfileSetup) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);
  const { data: profile, error: readError } = await supabase.from("profiles").select("user_settings").eq("user_id", auth.userId).single();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 });

  const existingSettings =
    profile?.user_settings && typeof profile.user_settings === "object"
      ? (profile.user_settings as Record<string, unknown>)
      : {};
  const existingSetup =
    existingSettings.profileSetup && typeof existingSettings.profileSetup === "object"
      ? (existingSettings.profileSetup as Record<string, unknown>)
      : {};
  const mergedSettings = {
    ...existingSettings,
    profileSetup: {
      ...existingSetup,
      dismissedAt: new Date().toISOString(),
    },
  };
  const { error: updateError } = await supabase.from("profiles").update({ user_settings: mergedSettings }).eq("user_id", auth.userId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  const response = NextResponse.json({ dismissed: true });
  auth.applyRefreshedCookies(response);
  return response;
}
