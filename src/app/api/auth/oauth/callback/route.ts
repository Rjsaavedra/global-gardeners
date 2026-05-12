import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setAuthCookies } from "@/lib/supabase/auth-cookies";
import { getOnboardingStatus } from "@/lib/supabase/onboarding-status";

function getSiteUrl(request: Request) {
  const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  const headers = request.headers;
  const forwardedProto = headers.get("x-forwarded-proto");
  const forwardedHost = headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const persistent = requestUrl.searchParams.get("persistent") !== "0";
  const source = requestUrl.searchParams.get("source") === "signup" ? "signup" : "login";
  const siteUrl = getSiteUrl(request);

  if (!code) {
    const fallbackUrl = new URL(source === "signup" ? "/signup" : "/login", siteUrl);
    fallbackUrl.searchParams.set("oauth", "implicit");
    fallbackUrl.searchParams.set("persistent", persistent ? "1" : "0");
    fallbackUrl.searchParams.set("source", source);
    return NextResponse.redirect(fallbackUrl);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL(`/${source}?error=oauth_exchange_failed`, siteUrl));
  }

  const onboardingStatus = await getOnboardingStatus(data.session.access_token);
  const response = NextResponse.redirect(new URL(onboardingStatus.nextStep, siteUrl));
  setAuthCookies(response, data.session, { persistent });
  return response;
}
