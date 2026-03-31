import { NextResponse } from "next/server";
import { createAuthedSupabaseClient } from "@/lib/supabase/authed-client";
import { resolveAuthenticatedRequest } from "@/lib/supabase/request-session";

type SubscriptionPlan = "free" | "premium";

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: SubscriptionPlan };
  const plan = body.plan;

  if (plan !== "free" && plan !== "premium") {
    return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
  }

  const supabase = createAuthedSupabaseClient(auth.accessToken);

  if (plan === "free") {
    const { error } = await supabase
      .from("profiles")
      .update({ subscription: "free", subscription_selected_at: new Date().toISOString() })
      .eq("user_id", auth.userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const response = NextResponse.json({ subscription: "free" });
    auth.applyRefreshedCookies(response);
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("premium_trial_started_at, premium_trial_ends_at")
    .eq("user_id", auth.userId)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const updatePayload: {
    subscription: "premium";
    premium_trial_started_at?: string;
    premium_trial_ends_at?: string;
    subscription_selected_at: string;
  } = {
    subscription: "premium",
    subscription_selected_at: new Date().toISOString(),
  };

  if (!profile?.premium_trial_started_at) {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setMonth(trialEnd.getMonth() + 1);
    updatePayload.premium_trial_started_at = now.toISOString();
    updatePayload.premium_trial_ends_at = trialEnd.toISOString();
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("user_id", auth.userId)
    .select("subscription, premium_trial_started_at, premium_trial_ends_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const response = NextResponse.json(updated);
  auth.applyRefreshedCookies(response);
  return response;
}
