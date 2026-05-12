import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OAuthStartBody = {
  keepSignedIn?: boolean;
  source?: "login" | "signup";
};

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as OAuthStartBody;
  const keepSignedIn = body.keepSignedIn ?? true;
  const source = body.source === "signup" ? "signup" : "login";
  const siteUrl = getSiteUrl(request);

  const callbackUrl = new URL("/api/auth/oauth/callback", siteUrl);
  callbackUrl.searchParams.set("persistent", keepSignedIn ? "1" : "0");
  callbackUrl.searchParams.set("source", source);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "Unable to start Facebook login." }, { status: 400 });
  }

  return NextResponse.json({ url: data.url });
}
