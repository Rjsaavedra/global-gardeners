import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/supabase/auth-cookies";
import { getOnboardingStatus } from "@/lib/supabase/onboarding-status";

type OAuthSessionBody = {
  accessToken?: string;
  refreshToken?: string;
  persistent?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as OAuthSessionBody;
  const accessToken = body.accessToken ?? "";
  const refreshToken = body.refreshToken ?? "";
  const persistent = body.persistent ?? true;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing OAuth session tokens." }, { status: 400 });
  }

  const onboardingStatus = await getOnboardingStatus(accessToken);
  const response = NextResponse.json({ nextStep: onboardingStatus.nextStep });
  setAuthCookies(response, { access_token: accessToken, refresh_token: refreshToken }, { persistent });
  return response;
}
